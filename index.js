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
 * @param {any} ctx 
 * @param {any} options 
 * @param {any} group 
 * @param {any} controller 
 * @param {any} action 
 * @returns 
 */
const execAction = function (ctx, options, group, controller, action) {
    group = group || '';
    controller = controller || '';
    action = action || '';
    if (!controller) {
        ctx.throw(404, 'Controller not found.');
    }
    let instance, cls;
    try {
        //multi mod
        if (group) {
            cls = think._caches.controllers[`${group}/${controller}`];
        } else {
            cls = think._caches.controllers[controller];
        }
        instance = new cls(ctx);
    } catch (e) {
        ctx.throw(404, `Controller ${group ? group + '/' : ''}${controller} not found.`);
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

module.exports = function (options) {
    options = options ? lib.extend(defaultOptions, options, true) : defaultOptions;
    think.app.once('appReady', () => {
        lib.define(think, 'action', function (name, ctx) {
            name = name.split('/');
            if (name.length < 2 || !name[0]) {
                return ctx.throw(404, `When call think.action, controller is undefined,  `);
            }
            return execAction(ctx, options, name[2] ? name[0] : '', name[2] ? name[1] : name[0], name[2] ? name[2] : name[1]);
        });
    });
    return function (ctx, next) {
        return execAction(ctx, options, ctx.group, ctx.controller, ctx.action);
    };
};