import { Id, MApp } from '@tmagic/schema';

// import { Id } from '@tmagic/schema';
import { RemoveData, Runtime, UpdateData } from './types';
// import {getNodePath} from "@tmagic/utils";
// import {Core} from "@tmagic/core";

export default class Vue3Runtime implements Runtime {
  // private root = new MApp() ; //ref<MApp>();
  // private curPageId = ref<Id>();
  // private selectedId = ref<Id>();
  //
  // private pageConfig = computed(
  //   () => root.value?.items?.find((item: MNode) => item.id === curPageId.value) || root.value?.items?.[0],
  // );
  //
  // const app = new Core({
  //   config: root.value,
  //   platform: 'editor',
  // });

  // provide('app', app);

  public getApp(): any {
    // return app;
    return 'app';
  }

  public updateRootConfig(config: MApp): void {
    console.log('update config', config);
    // root.value = config;
    // app?.setConfig(config, curPageId.value);
  }

  public updatePageId(id: Id): void {
    console.log('update page id', id);
    // curPageId.value = id;
    // app?.setPage(id);
  }

  public getSnapElements() {
    return Array.from(document.querySelectorAll<HTMLElement>('[class*=magic-ui][id]'));
  }

  public select(id: Id): Promise<HTMLElement> {
    console.log('select config', id);
    // selectedId.value = id;
    const el = document.getElementById(`${id}`);
    // if (el) return el;
    // // // 未在当前文档下找到目标元素，可能是还未渲染，等待渲染完成后再尝试获取
    // return nextTick().then(() => document.getElementById(`${id}`) as HTMLElement);
    // @ts-ignore
    return Promise.resolve(el);
  }

  public add({ config }: UpdateData) {
    console.log('===========>add config', config);

    // if (!root.value) throw new Error('error');
    // if (!selectedId.value) throw new Error('error');
    // const path = getNodePath(selectedId.value, [root.value]);
    // const node = path.pop();
    // const parent = node?.items ? node : path.pop();
    // if (!parent) throw new Error('未找到父节点');
    // parent.items?.push(config);
  }

  public update({ config }: UpdateData) {
    console.log('update config', config);
    // if (!root.value) throw new Error('error');
    // const path = getNodePath(config.id, [root.value]);
    // const node = path.pop();
    // const parent = path.pop();
    // if (!node) throw new Error('未找到目标节点');
    // if (!parent) throw new Error('未找到父节点');
    // const index = parent.items?.findIndex((child: MNode) => child.id === node.id);
    // parent.items.splice(index, 1, reactive(config));
  }

  public remove({ id }: RemoveData) {
    console.log('remove id', id);
    // if (!root.value) throw new Error('error');
    // const path = getNodePath(id, [root.value]);
    // const node = path.pop();
    // if (!node) throw new Error('未找到目标元素');
    // const parent = path.pop();
    // if (!parent) throw new Error('未找到父元素');
    // const index = parent.items?.findIndex((child: MNode) => child.id === node.id);
    // parent.items.splice(index, 1);
  }
}
