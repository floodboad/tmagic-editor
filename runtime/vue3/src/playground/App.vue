<template>
  <!--  <magic-ui-page v-if="pageConfig" :config="pageConfig"></magic-ui-page>-->
  <div id="luckysheet"></div>
</template>

<script lang="ts">
import { computed, defineComponent, nextTick, onMounted, provide, reactive, ref, watch } from 'vue';
// import { RichSpread } from '@buff2017/rich-spreadsheet';

import Core from '@tmagic/core';
import { Id, MApp, MNode } from '@tmagic/schema';
import { Magic, RemoveData, UpdateData } from '@tmagic/stage';
import { getNodePath } from '@tmagic/utils';
import { initSheet, handlerAdd } from "../modules/elsheet/index";

declare global {
  interface Window {
    magic: Magic;
  }
}

export default defineComponent({
  setup() {
    const root = ref<MApp>();
    const curPageId = ref<Id>();
    const selectedId = ref<Id>();

    const pageConfig = computed(
      () => root.value?.items?.find((item: MNode) => item.id === curPageId.value) || root.value?.items?.[0],
    );

    const app = new Core({
      config: root.value,
      platform: 'editor',
    });

    provide('app', app);

    watch(pageConfig, async () => {
      await nextTick();
      const page = document.querySelector<HTMLElement>('.magic-ui-page');
      page && window.magic.onPageElUpdate(page);
    });

    // const richsheet = new RichSpread();

    onMounted(() => {
      initSheet();

      // RichSpread.create({
      //   container: 'luckysheet',
      //   lang: 'zh',
      //   forceCalculation: false,
      //   fontList: [],
      //   columnHeaderHeight: 30,
      //   defaultColWidth: 120, //  col 宽度
      //   defaultRowHeight: 30, //  cell 高度
      //   rowHeaderWidth: 40, //  左侧序号宽度
      //   showtoolbar: false,
      //   showinfobar: false,
      //   showsheetbar: false,
      //   showstatisticBar: false,
      //   data: [
      //     {
      //       name: 'Cell',
      //       index: '0',
      //       zoomRatio: 1,
      //       order: '0',
      //       column: [],
      //       row: 12,
      //       celldata: [
      //         {
      //           r: 0,
      //           c: 0,
      //           v: {
      //             customKey: { a: 1 },
      //             bg: null,
      //             bl: 0,
      //             it: 0,
      //             ff: 0,
      //             fs: 11,
      //             fc: 'rgb(51, 51, 51)',
      //             ht: 1,
      //             vt: 1,
      //             v: 1,
      //             ct: { fa: 'General', t: 'n' },
      //             m: '1',
      //           },
      //         },
      //       ],
      //       frozen: {
      //         type: 'cancel',
      //         // type: "rangeColumn",
      //         // range: {
      //         //   row_focus: 0,
      //         //   column_focus: 2,
      //         // },
      //       },
      //       config: {
      //         columnlen: {
      //           2: 540,
      //         },
      //         columnsGroup: [
      //           // {
      //           //   start: 1,
      //           //   end: 4,
      //           //   hide: false,
      //           // },
      //           // {
      //           //   start: 8,
      //           //   end: 12,
      //           //   hide: true,
      //           // },
      //         ],
      //       },
      //     },
      //   ],
      // });
      window.magic?.onRuntimeReady({
        getApp() {
          return app;
        },

        updateRootConfig(config: MApp) {
          console.log('update config', config);
          root.value = config;
          app?.setConfig(config, curPageId.value);
        },

        updatePageId(id: Id) {
          console.log('update page id', id);
          curPageId.value = id;
          app?.setPage(id);
        },

        getSnapElements() {
          return Array.from(document.querySelectorAll<HTMLElement>('[class*=magic-ui][id]'));
        },

        select(id: Id) {
          console.log('select config', id);
          selectedId.value = id;
          const el = document.getElementById(`${id}`);
          if (el) return el;
          // 未在当前文档下找到目标元素，可能是还未渲染，等待渲染完成后再尝试获取
          return nextTick().then(() => document.getElementById(`${id}`) as HTMLElement);
        },

        add({ config }: UpdateData) {
          console.log('add config', config);
          handlerAdd( config );
          // if (!root.value) throw new Error('error');
          // if (!selectedId.value) throw new Error('error');
          // const path = getNodePath(selectedId.value, [root.value]);
          // const node = path.pop();
          // const parent = node?.items ? node : path.pop();
          // if (!parent) throw new Error('未找到父节点');
          // parent.items?.push(config);
        },

        update({ config }: UpdateData) {
          console.log('update config', config);
          if (!root.value) throw new Error('error');
          const path = getNodePath(config.id, [root.value]);
          const node = path.pop();
          const parent = path.pop();
          if (!node) throw new Error('未找到目标节点');
          if (!parent) throw new Error('未找到父节点');
          const index = parent.items?.findIndex((child: MNode) => child.id === node.id);
          parent.items.splice(index, 1, reactive(config));
        },

        remove({ id }: RemoveData) {
          if (!root.value) throw new Error('error');
          const path = getNodePath(id, [root.value]);
          const node = path.pop();
          if (!node) throw new Error('未找到目标元素');
          const parent = path.pop();
          if (!parent) throw new Error('未找到父元素');
          const index = parent.items?.findIndex((child: MNode) => child.id === node.id);
          parent.items.splice(index, 1);
        },
      });
    });

    return {
      pageConfig,
    };
  },
});
</script>

<style lang="scss">
html,
body,
#app {
  width: 100%;
  height: 100%;
}

#app {
  position: relative;
  overflow: auto;

  &::-webkit-scrollbar {
    width: 0;
  }
}

.magic-ui-container {
  background-color: rgba(136, 136, 136, 0.5);
}

.action-area {
  background-color: rgba(51, 153, 255, 0.5) !important;
}
</style>
