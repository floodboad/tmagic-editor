/*
 * Tencent is pleased to support the open source community by making TMagicEditor available.
 *
 * Copyright (C) 2021 THL A29 Limited, a Tencent company.  All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { EventEmitter } from 'events';

import { compose } from '@editor/utils/compose';

const methodName = (prefix: string, name: string) => `${prefix}${name[0].toUpperCase()}${name.substring(1)}`;

const isError = (error: any): boolean => Object.prototype.toString.call(error) === '[object Error]';

/**
 * 提供两种方式对Class进行扩展
 * 方法1：
 * 给Class中的每个方法都添加before after两个钩子
 * 给Class添加一个usePlugin方法，use方法可以传入一个包含before或者after方法的对象
 *
 * 例如：
 *   Class EditorService extends BaseService {
 *     constructor() {
 *       super(['add']);
 *     }
 *     add(value) { return result; }
 *   };
 *
 *   const editorService = new EditorService();
 *
 *   editorService.usePlugin({
 *     beforeAdd(value) { return [value] },
 *     afterAdd(value, result) {},
 *   });
 *
 *   editorService.add(); 最终会变成  () => {
 *    editorService.beforeAdd();
 *    editorService.add();
 *    editorService.afterAdd();
 *   }
 *
 * 调用时的参数会透传到before方法的参数中, 然后before的return 会作为原方法的参数和after的参数，after最后一个参数则是原方法的return值;
 * 如需终止后续方法调用可以return new Error();
 *
 * 方法2：
 * 给Class中的每个方法都添加中间件
 * 给Class添加一个use方法，use方法可以传入一个包含源对象方法名作为key值的对象
 *
 * 例如：
 *   Class EditorService extends BaseService {
 *     constructor() {
 *       super(['add']);
 *     }
 *     add(value) { return result; }
 *   };
 *
 *  const editorService = new EditorService();
 *  editorService.use({
 *    add(value, next) { console.log(value); next() },
 *  });
 */
export default class extends EventEmitter {
  private pluginOptionsList: Record<string, Function[]> = {};
  private middleware: Record<string, Function[]> = {};

  constructor(methods: string[]) {
    super();

    methods.forEach((propertyName: string) => {
      const scope = this as any;

      const sourceMethod = scope[propertyName];

      const beforeMethodName = methodName('before', propertyName);
      const afterMethodName = methodName('after', propertyName);

      this.pluginOptionsList[beforeMethodName] = [];
      this.pluginOptionsList[afterMethodName] = [];
      this.middleware[propertyName] = [];

      const fn = compose(this.middleware[propertyName]);
      Object.defineProperty(scope, propertyName, {
        value: async (...args: any[]) => {
          let beforeArgs = args;

          for (const beforeMethod of this.pluginOptionsList[beforeMethodName]) {
            let beforeReturnValue = (await beforeMethod(...beforeArgs)) || [];

            if (isError(beforeReturnValue)) throw beforeReturnValue;

            if (!Array.isArray(beforeReturnValue)) {
              beforeReturnValue = [beforeReturnValue];
            }

            beforeArgs = beforeArgs.map((v: any, index: number) => {
              if (typeof beforeReturnValue[index] === 'undefined') return v;
              return beforeReturnValue[index];
            });
          }

          let returnValue = await fn(beforeArgs, sourceMethod.bind(scope));

          for (const afterMethod of this.pluginOptionsList[afterMethodName]) {
            returnValue = await afterMethod(...beforeArgs, returnValue);

            if (isError(returnValue)) throw returnValue;
          }

          return returnValue;
        },
      });
    });
  }

  public use(options: Record<string, Function>) {
    Object.entries(options).forEach(([methodName, method]: [string, Function]) => {
      if (typeof method === 'function') this.middleware[methodName].push(method);
    });
  }

  public usePlugin(options: Record<string, Function>) {
    Object.entries(options).forEach(([methodName, method]: [string, Function]) => {
      if (typeof method === 'function') this.pluginOptionsList[methodName].push(method);
    });
  }
}
