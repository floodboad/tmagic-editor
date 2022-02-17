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

import * as props from '@editor/utils/props';

jest.mock('@editor/utils/logger', () => ({
  log: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  error: jest.fn(),
}));

describe('util form', () => {
  it('fillConfig', () => {
    const defaultConfig = props.fillConfig();

    const config = props.fillConfig([
      {
        text: 'text',
        name: 'text',
        type: 'text',
      },
    ]);

    expect(config[0].items[0].items.length - defaultConfig[0].items[0].items.length).toBe(1);
  });

  it('getDefaultValue', () => {
    const value = props.getDefaultPropsValue('text');
    expect(value.id.startsWith('text')).toBeTruthy();
  });
});
