let control = {
    "D01": { width: 50},
    "D02": {},
    "D03": { width: 50 },
    "D04": { width: 100 },
    "D05": { width: 50 },
    "D06": { width: 50 },
    "D07": { width: 50 },
    "D08": { width: 100 }
};
let arrRow   = [];
let rootNode = document.createElement("div");
let isFilledItem = true;
let maxItemsCnt  = 2;

let ctlEntries = Object.entries(control);
for(let i = 0; i < ctlEntries.length; i++) {

    let [crntKey, objCrnt] = ctlEntries[i];
    let [nextKey, objNext] = ctlEntries[i + 1] || ["", ""];

    objCrnt.artclNo = crntKey;
    let objAddInfo = chkAddRow( objCrnt, objNext );

    let rowNode = null;
    if (arrRow.length === 0 || objAddInfo.isAddItem === true) {
        rowNode = addRow( crntKey );
        rootNode.appendChild(rowNode);
    } 
    else {
        //마지막
        rowNode = Array.from(rootNode.querySelectorAll(`[class="search-row"]`)).pop();
    }

    let newItemNode = generateSearchItem();
    newItemNode.dataset.tboardArtclNo   = objCrnt.artclNo;
    newItemNode.dataset.tboardItemWidth = objCrnt.width || 100;
    rowNode.appendChild(newItemNode);

    if (isFilledItem === true) {
        let itemCnt = rowNode.querySelectorAll(`[class="search-item"]`).length;
        if (itemCnt >= maxItemsCnt) {
            continue;
        }

        if (objAddInfo.isAddEmpty) {
            let emptyItem = generateSearchItem();
            while(emptyItem.firstChild) {
                emptyItem.firstChild.remove();
            }
            emptyItem.dataset.tboardItemWidth = "empty";
            rowNode.appendChild(emptyItem);
        }
    }
}



function chkAddRow(_objCrnt, _objNext) {
    let rtnObj = {
        isAddItem: false
        , isAddEmpty: false    
    };    
    let crtnItemWidth      = _objCrnt.width || 100;
    let nextItemWidth      = _objNext.width || 100;

    let lastIndex  = arrRow.length - 1;
    let lastObject = lastIndex === -1 ? {} : arrRow[lastIndex];
    if (lastIndex - 1) {
        arrRow.push(lastObject);
    }

    console.log("lastObject", lastObject);
    //기등록된 width값 합계
    let sumWidth = 0;
    Object.entries(lastObject).forEach(([_artclNo, _width]) => {           
        sumWidth = sumWidth + _width;
    });

    if (sumWidth + crtnItemWidth <= 100) {
        console.log( "sumWidth1 " + sumWidth);
        lastObject[_objCrnt.artclNo] = crtnItemWidth;

        rtnObj.isAddItem = false;
    }
    else {
        console.log( "sumWidth2 " + sumWidth);
        let newRow = {};
        newRow[_objCrnt.artclNo] = crtnItemWidth;
        arrRow.push(newRow);

        rtnObj.isAddItem = true;
    }

    if (lastIndex === -1) {
        rtnObj.isAddItem = true;
    }

    //행을 넘겨야 됨
    if (rtnObj.isAddItem) {
        if (crtnItemWidth === 100 || (crtnItemWidth + nextItemWidth <= 100)) {
            rtnObj.isAddEmpty = false;
        }
        else {
            rtnObj.isAddEmpty = true;
        }
    }
    else {
        if (sumWidth + crtnItemWidth + nextItemWidth <= 100) {
            rtnObj.isAddEmpty = false;
        }
        else {
            rtnObj.isAddEmpty = true;
        }
    }
    return rtnObj;
}



function addRow(_artclNo) {
    let node = document.createElement("div");
    node.classList.add("search-row");
    return node;
}

function generateSearchItem() {
    let div = document.createElement("div");
    div.innerHTML = `
        <div class="search-item">
            <div tboard-data-id="type_default_title">
                <span>조회 조건</span>
            </div>
            <div tboard-data-id="type_default_self">                    
                <select id="search-type">
                    <option value="all">전체</option>
                    <option value="title">제목</option>
                    <option value="content">내용</option>
                </select>
                <input type="text" id="search-keyword" placeholder="검색어 입력">
            </div>
        </div>
    `;
    return div.firstElementChild;
}



console.log("--------------");


// 페이지 로드 시 조회조건 요소 생성
document.addEventListener('DOMContentLoaded', () => {    
    setTimeout(() => {
        document.querySelector(`[data-tboard-id="tboard-root"]`).appendChild(rootNode);
        console.log(rootNode);
    }, 100);

});

