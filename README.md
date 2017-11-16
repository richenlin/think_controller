# 介绍
-----

[![npm version](https://badge.fury.io/js/think_controller.svg)](https://badge.fury.io/js/think_controller)
[![Dependency Status](https://david-dm.org/thinkkoa/think_controller.svg)](https://david-dm.org/thinkkoa/think_controller)

Middleware Controller for ThinkKoa.

# 安装
-----

```
npm i think_controller
```

# 使用
-----

1、controller中间件为thinkkoa内置中间件,无需在项目中创建引用。该中间件默认开启

2、项目中间件配置 config/middleware.js:
```
config: { //中间件配置
    ...,
    controller: {
        action_suffix: 'Action', //方法后缀,带后缀的方法为公共方法
        empty_action: '__empty', //空方法,如果访问控制器中不存在的方法,默认调用
        common_before: '__before', //控制器类公共前置方法,除私有方法外其他方法执行时自动调用
        self_before: '_before_', //控制器类某个方法自身的前置方法(前缀),该方法执行时自动调用
    }
}
```