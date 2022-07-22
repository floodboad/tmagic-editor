import {
  RichSpread,
  insertRowOrColumnCellSync,
  insertRowBottomOrColumnRightCellSync,
  deleteRowOrColumnCellSync,
  // deleteRowsByIds,
  // getCurrentSheet,
  setFrozen,
  cancelFrozenHacks,
  getSelectedRowIds,
  showLoading,
  hideLoading,
  setCellValue,
  // hideColumnByIndex,
  deleteColumnByIndex,
  setColumnGroup,
  removeColumnGroup,
  updateCellsNote,
  // updateCellNoteId,
  deleteCellNoteById,
  showCellNoteById,
  getRowIdByRowIndex,
  getColumnByColIndex,
  // deepClone,
  reFreshCellByCoord
} from "@buff2017/rich-spreadsheet";
import { cols, rows } from "./data.js";
import cellRenderers from "./cellRenderers/index";
import cellEditors from "./cellEditors";
import cellTransformer from "./cellTransfomer";
import ColumnTitleRenderers from "./columnTitleRenderers";
import GsClipboardHandler from "./GSClipboard/handler/index";
import {UpdateData} from "@tmagic/stage";
import {MNode} from "@tmagic/schema";
// import { deepClone } from "@buff2017/rich-spreadsheet/controllers/hooks/helper";
// import {getScreenshot1, renderCell, reFreshCellByCoord } from "@buff2017/rich-spreadsheet/global/api.js"

const { cancelFrozen, setBothFrozen } = RichSpread;

function create() {
  RichSpread.create({
    cellRenderers,
    cellEditors,
    cellTransformer,
    ColumnTitleRenderers,
    GSClipboardOptions: {
      handlers: GsClipboardHandler,
    },
    sensitiveOperationDetect: 10,
    sensitiveOperationDetectHandler(msg) {
      console.log(msg);
      return new Promise((res) => {
        // setTimeout(()=>{
        res(true);
        // },3000)
      });
    },
    rowTitleNumberRender(number) {
      return number;
    },
    ContextMenu(params, type) {
      //  找到最后一个 column
      const lastColumnIndex =
        params.selection[params.selection.length - 1].column[1];
      const lastRowIndex = params.selection[params.selection.length - 1].row[1];

      if (type === "cell") {
        return [
          {
            name: "复制",
            action() {},
          },
          {
            name: "编辑",
            action() {},
          },
          {
            name: "备注",
            action() {
              showCellNoteById(
                getRowIdByRowIndex(lastRowIndex),
                getColumnByColIndex(lastColumnIndex).id
              );
            },
          },
          {
            name: "删除备注",
            action() {
              deleteCellNoteById(
                getRowIdByRowIndex(lastRowIndex),
                getColumnByColIndex(lastColumnIndex).id
              );
            },
          },
        ];
      }

      if (type === "row") {
        return [
          {
            name: `向上插入 ${params.rows.length} 行`,
            action() {
              const lastStartRow =
                params.selection[params.selection.length - 1].row[0];

              let newArr = [];
              params.rows.map((row, index) => {
                newArr.push({
                  id: Math.ceil(Math.random() * 999999),
                });
              });

              insertRowOrColumnCellSync("row", lastStartRow, newArr);
            },
          },
          {
            name: `向下插入 ${params.rows.length} 行`,
            action() {
              const lastStartRow =
                params.selection[params.selection.length - 1].row[1];

              let newArr = [];
              params.rows.map((row, index) => {
                newArr.push({
                  id: Math.ceil(Math.random() * 999999),
                });
              });

              insertRowBottomOrColumnRightCellSync("row", lastStartRow, newArr);
            },
          },
          {
            separator: true,
          },
          {
            name: "编辑当前行",
            action() {},
          },
          {
            name: "复制当前行",
            action() {
              const lastStartRow =
                params.selection[params.selection.length - 1].row[1];

              let newArr = [];
              params.rows.map((row, index) => {
                const newItem = deepClone(row);
                newItem.id = Math.ceil(Math.random() * 9999);
                newArr.push(newItem);
              });

              insertRowBottomOrColumnRightCellSync("row", lastStartRow, newArr);
            },
          },
          {
            name: `删除所选的 ${params.rows.length} 行`,
            action() {
              const [startIndex, endIndex] =
                params.selection[params.selection.length - 1].row;

              for (let i = startIndex; i <= endIndex; i++) {
                console.log(i)
                deleteRowOrColumnCellSync("row", i, i);
              }
              console.log("删除当前行");
            },
          },
          {
            separator: true,
          },
          {
            name: `冻结到第${lastRowIndex + 1}行`,
            action() {
              setFrozen({
                row: lastRowIndex,
              });
            },
          },
          {
            name: "取消行冻结",
            disabled: true,
            action() {
              cancelFrozenHacks("row");
            },
          },
        ];
      }

      if (type === "column") {
        return [
          {
            name: `冻结到第${lastColumnIndex + 1}列 (${
              params.currentSheet.column[lastColumnIndex].headerName
            })`,
            icon: "luckysheet-iconfont-quanjiabiankuang",
            action() {
              setFrozen({
                col: lastColumnIndex,
              });
            },
          },
          {
            name: "取消列冻结",
            disabled: true,
            action() {
              cancelFrozenHacks("column");
            },
          },
          {
            name: "隐藏当前列",
            action: () => {
              const lastColumnIndex =
                params.selection[params.selection.length - 1].column[1];

              deleteColumnByIndex(lastColumnIndex);
            },
          },
          {
            separator: true,
          },
          {
            name: "排序",
            subMenus: [
              {
                name: "A-Z",
              },
              {
                name: "Z-A",
              },
            ],
          },
          {
            separator: true,
          },
          {
            name: "分组",
            action() {
              const [start, end] = params.selection[0].column;
              setColumnGroup(start, end);
            },
          },
          {
            name: "取消分组",
            action() {
              const [start, end] = params.selection[0].column;
              removeColumnGroup(start, end);
            },
          },
        ];
      }
    },

    container: "luckysheet",
    lang: "zh",
    forceCalculation: false,
    fontList: [],
    columnHeaderHeight: 30,
    defaultColWidth: 120, //  col 宽度
    defaultRowHeight: 30, //  cell 高度
    rowHeaderWidth: 40, //  左侧序号宽度
    showtoolbar: false,
    showinfobar: false,
    showsheetbar: false,
    showstatisticBar: false,
    hook: {
      cellDragStop: function (cell, postion, sheetFile, ctx, event) {
        console.info("--------------> cell dragstop starting :");
        console.info("--------------> cell dragstop:",cell, postion, sheetFile, ctx, event);
      }
    },
    data: [
      {
        name: "Cell",
        index: "0",
        zoomRatio: 1,
        order: "0",
        column: cols,
        row: rows.length + 2,
        celldata: rows,
        frozen: {
          type: "cancel",
          // type: "rangeColumn",
          // range: {
          //   row_focus: 0,
          //   column_focus: 2,
          // },
        },
        config: {
          columnlen: {
            2: 540,
          },
          columnsGroup: [
            // {
            //   start: 1,
            //   end: 4,
            //   hide: false,
            // },
            // {
            //   start: 8,
            //   end: 12,
            //   hide: true,
            // },
          ],
        },
      },
    ],
  });
}

// create();

setTimeout(() => {
  updateCellsNote([
    {
      rowId: getRowIdByRowIndex(0),
      colId: getColumnByColIndex(0).id,
      note: "我是备注",
      width: 192,
      height: 40,
    },
    {
      rowId: getRowIdByRowIndex(0),
      colId: getColumnByColIndex(7).id,
      note: "2我是备注",
      width: 400,
      height: 80,
    },
  ]);
}, 1000);

let unsub = RichSpread.$on("ColumnHidden", (args) => {
  // console.log(args);
});

RichSpread.$on("ColumnsGroupChange", (args) => {
  // console.log(args,'ColumnsGroupChange');
});

RichSpread.$on("message", (args) => {
  console.log(args);
});

//  获取 rows id
// document.querySelector("#rowIds").addEventListener("click", () => {
//   console.log(getSelectedRowIds());
//
//   showLoading();
//   setTimeout(() => {
//     hideLoading();
//   }, 2000);
// });
//
// //  更新 cell
// document.querySelector("#updateCell").addEventListener("click", () => {
//   setCellValue(0, 0, `new value ${Math.random()}`, {
//     force: true,
//     reRenderCell: true,
//   });
// });
//
// document.querySelector("#showNote").addEventListener("click", () => {
//   showCellNoteById(getRowIdByRowIndex(0), getColumnByColIndex(0).id);
// });
//
// // 显示图片base
// document.querySelector("#showScreenshot").addEventListener("click", () => {
//   console.log("====>click shot");
//   let uImg = getScreenshot1("A1:B2");
//   console.log("==========>img base 64", uImg);
//
// });
//
//
// // 渲染cell 1
// document.querySelector("#rendCell ").addEventListener("click", () => {
//   console.log("====>click shot");
//
//   let uImg = renderCell(9,1, "text");
//   console.log("==========>img base 64", uImg);
//
// });
//
//
//
// // 渲染cell 2
// document.querySelector("#rendCell1 ").addEventListener("click", () => {
//   console.log("====>click shot");
//
//   let uImg = reFreshCellByCoord(9,1);
//   console.log("==========>img base 64", uImg);
//
// });

export const initSheet = () => {
  create();
}

export const handlerAdd = ( config : MNode) => {
  console.log("=============> sheet add compoment", config);
  // RichSpread.reFreshCellByCoord(9,1);
  reFreshCellByCoord(9,1);
}
