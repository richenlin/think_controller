/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2017 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    17/6/1
 */
const lib = require('think_lib');
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
    return function (ctx, next) {
        if (!ctx.controller) {
            ctx.throw(404, 'Controller not found.');
        }
        let controller, cls;
        try {
            //multi mod
            if (ctx.group) {
                cls = think._caches.controllers[`${ctx.group}/${ctx.controller}`];
            } else {
                cls = think._caches.controllers[ctx.controller];
            }
            controller = new cls(ctx);
        } catch (e) {
            ctx.throw(404, `Controller ${ctx.group}/${ctx.controller} not found.`);
        }
        //exec action
        const suffix = options.action_suffix || 'Action';
        const empty = options.empty_action || '__empty';
        let act = `${ctx.action}${suffix}`;
        if (!controller[act] && controller[empty]) {
            act = empty;
        }
        if (!controller[act]) {
            ctx.throw(404, `Action ${ctx.action} not found.`);
        }

        const commBefore = options.common_before || '__before';
        const selfBefore = `${options.self_before || '_before_'}${ctx.action}`;

        let promises = Promise.resolve();
        //common befroe
        if (controller[commBefore]) {
            promises = promises.then(() => {
                return controller[commBefore]();
            });
        }
        //self before
        if (controller[selfBefore]) {
            promises = promises.then(() => {
                return controller[selfBefore]();
            });
        }
        //action
        return promises.then(() => {
            return controller[act]();
        });
    };
};