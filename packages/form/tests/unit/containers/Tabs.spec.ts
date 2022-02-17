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

import { mount } from '@vue/test-utils';
import ElementPlus from 'element-plus';

import MagicForm, { FormConfig, MForm, MTabs } from '../../../src';

const getWrapper = (
  config: FormConfig = [
    {
      type: 'tab',
      items: [
        {
          title: 'tab1',
          items: [
            {
              name: 'text',
              text: 'text',
            },
          ],
        },
      ],
    },
  ],
  initValues: any = {
    text: 'text',
  },
) =>
  mount(MForm, {
    global: {
      plugins: [ElementPlus as any, MagicForm as any],
    },
    props: {
      initValues,
      config,
    },
  });

describe('Tabs', () => {
  it('基础', () => {
    const wrapper = getWrapper();

    setTimeout(async (done) => {
      const tabs = wrapper.findComponent(MTabs);
      expect(tabs.exists()).toBe(true);
      const value = await (wrapper.vm as any).submitForm();
      expect(value.text).toBe('text');
      done();
    }, 0);
  });
});
