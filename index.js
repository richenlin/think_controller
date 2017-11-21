/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2017 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    17/6/1
 */
const lib = require('think_lib');
/**
 * 
 * 
 * @param {any} app 
 * @param {any} ctx 
 * @param {any} options 
 * @param {any} group 
 * @param {any} controller 
 * @param {any} action 
 * @returns 
 */
const exec = function (app, ctx, options, group, controller, action) {
    group = group || '';
    controller = controller || '';
    action = action || '';
    if (!controller) {
        ctx.throw(404, 'Controller not found.');
    }
    let instance, cls, caches = app.controllers || {};
    try {
        //multi mod
        if (group) {
            cls = caches[`${group}/${controller}`];
        } else {
            cls = caches[controller];
        }
        instance = new cls(ctx, app);
    } catch (e) {
        ctx.throw(404, app.app_debug ? e : `Controller ${group ? group + '/' : ''}${controller} not found.`);
    }
    //exec action
    const suffix = options.action_suffix || 'Action';
    const empty = options.empty_action || '__empty';
    let act = `${action}${suffix}`;
    if (!instance[act] && instance[empty]) {
        act = empty;
    }
    if (!instance[act]) {
        ctx.throw(404, `Action ${action} not found.`);
    }

    const commBefore = options.common_before || '__before';
    const selfBefore = `${options.self_before || '_before_'}${action}`;

    let promises = Promise.resolve();
    //common befroe
    if (instance[commBefore]) {
        promises = promises.then(() => {
            return instance[commBefore]();
        });
    }
    //self before
    if (instance[selfBefore]) {
        promises = promises.then(() => {
            return instance[selfBefore]();
        });
    }
    //action
    return promises.then(() => {
        return instance[act]();
    });
};
/**
 * default options
 */
const defaultOptions = {
    action_suffix: 'Action', //方法后缀,带后缀的方法为公共方法
    empty_action: '__empty', //空方法,如果访问控制器中不存在的方法,默认调用
    common_before: '__before', //控制器类公共前置方法,除私有方法外其他方法执行时自动调用
    self_before: '_before_', //控制器类某个方法自身的前置方法(前缀),该方法执行时自动调用
};

module.exports = function (options, app) {
    options = options ? lib.extend(defaultOptions, options, true) : defaultOptions;
    return function (ctx, next) {
        return exec(app, ctx, options, ctx.group, ctx.controller, ctx.action);
    };
};