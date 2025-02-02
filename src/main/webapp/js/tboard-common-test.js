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


    // 이미지를 가져올 서버의 URL
    const imageUrl = 'http://localhost:8080/tboard/api/get-image';  // Spring 서버에서 이미지 스트리밍할 URL
    const imageElement = document.createElement('img');  // 이미지 태그 생성
    imageElement.src = imageUrl;  // 서버 URL을 이미지 소스로 설정
    imageElement.alt = '이미지 로드 실패';  // 이미지가 실패할 경우의 대체 텍스트
    imageElement.style.width = '100%';  // 이미지 스타일링 (필요에 따라 수정 가능)

    // 이미지 요소를 data-tboard-id="image"에 추가
    const imageContainer = document.querySelector('[data-tboard-id="image"]');
    imageContainer.appendChild(imageElement);



   // let editingComment = null; // 수정 중인 댓글을 추적

    //document.getElementById("submitComment").addEventListener("click", function() {
        //const commentText = document.getElementById("commentText").value;
    
       // if (commentText.trim() === "") {
       //     alert("댓글을 입력하세요.");
      //      return;
        //}
    
        // 댓글이 수정 중일 때
        // if (editingComment) {
        //     editingComment.textContent = commentText; // 기존 댓글 내용 수정
        //     document.getElementById("submitComment").textContent = "댓글 등록"; // 버튼 텍스트 초기화
        //     editingComment = null; // 수정 중 상태 초기화
        // } else {
        //     // 새로운 댓글 등록
        //     const commentList = document.getElementById("commentsList");
    
        //     // 댓글 요소 생성
        //     const newComment = document.createElement("div");
        //     newComment.classList.add("comment");
        //     newComment.textContent = commentText;
    
        //     // 수정 및 삭제 버튼 추가
        //     const editButton = document.createElement("button");
        //     editButton.classList.add("edit-btn");
        //     editButton.textContent = "수정";
        //     editButton.onclick = function() {
        //         document.getElementById("commentText").value = newComment.textContent;
        //         document.getElementById("submitComment").textContent = "댓글 수정";
        //         editingComment = newComment; // 수정할 댓글로 설정
        //     };
    
        //     const deleteButton = document.createElement("button");
        //     deleteButton.classList.add("delete-btn");
        //     deleteButton.textContent = "삭제";
        //     deleteButton.onclick = function() {
        //         commentList.removeChild(newComment); // 댓글 삭제
        //     };
    
        //     // 버튼을 댓글에 추가
        //     newComment.appendChild(editButton);
        //     newComment.appendChild(deleteButton);
    
        //     // 댓글을 목록에 추가
        //     commentList.appendChild(newComment);
        // }
    
        // 텍스트 영역 초기화
       // document.getElementById("commentText").value = "";
    //});


    let ComponentManager = class {
        constructor(_type) {
            this.type = _type;
            this.commentAreaEl = document.getElementById("commentsList");
            this.cmpList = [];
            this.create();
        }

        reset() {
            this.cmpList = [];
        }

        create() {
            //기본 버튼 이벤트
            this.addDefaultEvent();

            //데이터 표시
            commentDatas.forEach( data => {
                let comment = new CommentComponent( data, this );
                //comment.setData(data);
                this.cmpList.push(comment);

                //읽기 모드
                //comment.setReadMode();

                //화면에 등록
                this.commentAreaEl.appendChild( comment.formEl.rootNode );
            });
        }

        setReadModeAll() {
            this.cmpList.forEach( cmp => {
                cmp.setReadMode();
            });
        }


        //기본 버튼 이벤트 설정
        addDefaultEvent() {
            const submitComment = document.createElement("button");
            submitComment.textContent = "저장";
            
            //저장
            submitComment.addEventListener("click", () => {
                const commentText = document.getElementById("commentText").value;
                this.saveComment(commentText);
            });
            
            //취소


            //기본등록
            commentComp.editEl.appendChild( submitComment);
        }
        
        //기본 저장 버튼
        saveComment(commentText) {
            //ajax

            //신규 1뎁스 댓글등록

            //컴포넌트 생성
            let newComp = new CommentComponent({cmtNm: commentText}, this);

            //ajax등록
            newComp.regist();

             //요소 추가
            if (this.cmpList.length > 0) {
                let referenceDiv = this.cmpList[0].formEl.rootNode;
                referenceDiv.insertAdjacentElement("beforebegin", newComp.formEl.rootNode);                
            }
            else {
                this.commentAreaEl.appendChild( newComp.formEl.rootNode );
            }

            //객체 추가
            this.cmpList.splice(0, 0, newComp);
        }


        //전체 댓글 객체에 등록
        addComment(index, data) {
            debugger;
            let newComp = new CommentComponent(data, this);

            //요소추가
            let referenceDiv = this.cmpList[index].formEl.rootNode;
            referenceDiv.insertAdjacentElement("afterend", newComp.formEl.rootNode);

            //객체추가
            this.cmpList.splice(index, 0, newComp);

        }

        //전체 댓글 객체에서 삭제
        deleteComment(index) {
            this.cmpList[index].formEl.rootNode.remove();
            this.cmpList.splice(index, 1);
        }

        cancelComment() {
        }
    };

    let CommentComponent = class {
        constructor(_data, _manager) {
            this.editMode = false;
            this.formEl = {
                rootNode : null
                , textarea : null
                , btnSave : null
                , btnEdit : null
                , btnDelete : null
                , btnReply: null
            };
            this.mananger = _manager;
            this.data = _data || {};

            this.createRootEl();
        }

        
        //수정모드 변경
        setEditMode(args) {
            if (this.editMode === true) {
                return;
            }

            this.editMode = true;
            this.formEl.rootNode;
            while (this.formEl.rootNode.firstChild) {
                this.formEl.rootNode.firstChild.remove();
            }

            this.setCommentRegistEl(args);
        }

        //읽기모드 변경
        setReadMode() {
            if (this.editMode === false) {
                return;
            }
            this.editMode = false;

            this.formEl.rootNode;
            while (this.formEl.rootNode.firstChild) {
                this.formEl.rootNode.firstChild.remove();
            }

            this.setCommentEl();
        }

        //댓글 객체 요소 생성
        createRootEl() {
            let newComment = document.createElement("div");
            newComment.classList.add("comment");            
            this.formEl.rootNode = newComment;

            
            this.setCommentEl();
        }

        //댓글 등록수정 모드
        setCommentRegistEl(args) {
            let self = this;
            let isRegist = args.isRegist;
            let registEl = document.createElement("div");
            registEl.classList.add("comment-form");
            registEl.innerHTML = `<textarea id="commentText" placeholder="댓글을 입력하세요..." rows="4"></textarea>`;

            if (isRegist === true) {
                registEl.querySelector("textarea").value = "";
            }
            else {
                registEl.querySelector("textarea").value = this.data.cmtNm;
            }


            //저장 버튼
            const saveButton = document.createElement("button");
            //saveButton.classList.add("delete-btn");
            saveButton.textContent = "저장";
            saveButton.onclick = () => {
                this.save( args );
            };

            //취소 버튼
            const cancelButton = document.createElement("button");
            //cancelButton.classList.add("delete-btn");
            cancelButton.textContent = "취소";
            cancelButton.onclick = () => {
                //commentList.removeChild(newComment); // 댓글 삭제
                //alert("취소 : " + JSON.stringify(data));
                this.cancel();
            };
            
            registEl.appendChild(saveButton);
            registEl.appendChild(cancelButton);

            this.formEl.rootNode.appendChild( registEl );
        }

        //댓글 읽기 모드
        setCommentEl() {
            let self = this;
            let data = this.data;

            //댓글 기본 표시 영역 
            //cloneNode(true)
            
            //댓글 내용
            this.formEl.rootNode.textContent = this.data.cmtNm;

            //댓글 등록자

            
            //댓글 등록 시간


            //등록 모드 변경 버튼
            const registButton = document.createElement("button");
            registButton.classList.add("edit-btn");
            registButton.textContent = "등록";

            //데이터로 레벨에 따라 클래스 설정            
            registButton.onclick = function() {
                //01.다른 댓글은 읽기 모드
                self.mananger.setReadModeAll();

                //02.등록,수정모드
                self.setEditMode({isRegist: true});
            };
    

            //수정 모드 변경 버튼
            const editButton = document.createElement("button");
            editButton.classList.add("edit-btn");
            editButton.textContent = "수정";

            //데이터로 레벨에 따라 클래스 설정            
            editButton.onclick = function() {
                //01.다른 댓글은 읽기 모드
                self.mananger.setReadModeAll();


                //02.등록,수정모드
                self.setEditMode({isRegist: false});
            };
    
            //삭제 버튼
            const deleteButton = document.createElement("button");
            deleteButton.classList.add("delete-btn");
            deleteButton.textContent = "삭제";
            deleteButton.onclick = function() {
                //commentList.removeChild(newComment); // 댓글 삭제
                alert("삭제 : " + JSON.stringify(data));
                self.delete();
            };

    
            // 버튼을 댓글에 추가            
            this.formEl.rootNode.appendChild(registButton);
            this.formEl.rootNode.appendChild(editButton);
            this.formEl.rootNode.appendChild(deleteButton);

            //더보기 버튼
            const moreButton = document.createElement("button");
            moreButton.classList.add("delete-btn");
            moreButton.textContent = "더보기";
            moreButton.onclick = function() {
                self.moreCommnet();
            };

            this.formEl.rootNode.appendChild(moreButton);
        }

        addEvent() {

        }

        //현재입력글 새로 등록
        regist() {
            debugger;
            let value = this.data.cmtNm;
            
            //ajax
            

            
        }

        //등록(하위뎁스로), 수정(현재댓글)
        save( args ) {
            //alert(this.formEl.rootNode.querySelector("textarea").value);
            let index = (this.mananger.cmpList|| []).findIndex(data=> data === this);
            let value = this.formEl.rootNode.querySelector("textarea").value;


            //ajax 처리
            alert(args.isRegist? "등록":"수정");

            //callback에서 처리, 레벨 + 1, pstNo, cmtNo
            if (args.isRegist) {
                //정보 등록
                this.mananger.addComment(index, {cmtNm: value});
            }
            else {
                //정보 갱신
                this.formEl.rootNode.querySelector("textarea").value = value;                
                this.data.cmtNm = value;
            }

            this.mananger.setReadModeAll();
        }

        //취소(읽기모드로)
        cancel() {
            this.mananger.setReadModeAll();
        }

        //현재댓글삭제
        delete() {
            //ajax

            let index = (this.mananger.cmpList|| []).findIndex(data=> data === this);
            this.mananger.deleteComment(index);
        }


        moreCommnet() {
            debugger;
            search();
        }

    };

    let commentComp = {editEl: document.querySelector(".comment-form")};
    let cmpnMng = new ComponentManager();
});


async function search() {
    try {
        console.log("search start");
    
        let result = await handleEvent();
        
        console.log("search end");
        return result;
    }
    catch(error) {
        console.log(error);
    }
    
}

async function handleEvent() {
    console.log("handleEvent start");
    try {
        let result = await searchPstList();
        
        console.log("handleEvent end", result);
        return "";
    }
    catch(error) {
        console.log(error);
    }
}

async function searchPstList() {
    console.log("searchPstList start");
    //try {
        let result = await basicAccess();

        console.log("searchPstList end", result);
        return result;
    //}
    //catch(error) {
      //  console.log(error);
    //}
}

async function basicAccess() {
    console.log("basicAccess start");
    let result = callAjax();

    console.log("basicAccess end", result);
    return result;
}

let flag = true;
async function callAjax() {
    return new Promise( (resolve, reject) => {
        if (flag) {
            setTimeout(()=> {
                console.log("success");
                //resolve("success");
                //return;
                
                console.log("error");
                reject("error");
                return;
                
            }, 1000)
            
        }
    });    
}













        //     // 새로운 댓글 등록
        //     const commentList = document.getElementById("commentsList");
    
        //     // 댓글 요소 생성
        //     const newComment = document.createElement("div");
        //     newComment.classList.add("comment");
        //     newComment.textContent = commentText;
    
        //     // 수정 및 삭제 버튼 추가
        //     const editButton = document.createElement("button");
        //     editButton.classList.add("edit-btn");
        //     editButton.textContent = "수정";
        //     editButton.onclick = function() {
        //         document.getElementById("commentText").value = newComment.textContent;
        //         document.getElementById("submitComment").textContent = "댓글 수정";
        //         editingComment = newComment; // 수정할 댓글로 설정
        //     };
    
        //     const deleteButton = document.createElement("button");
        //     deleteButton.classList.add("delete-btn");
        //     deleteButton.textContent = "삭제";
        //     deleteButton.onclick = function() {
        //         commentList.removeChild(newComment); // 댓글 삭제
        //     };
    
        //     // 버튼을 댓글에 추가
        //     newComment.appendChild(editButton);
        //     newComment.appendChild(deleteButton);
    
        //     // 댓글을 목록에 추가
        //     commentList.appendChild(newComment);



let commentDatas = [
    {
      "pstNo": "B20240119111",
      "cmtNo": "C20240119111",
      "pstLevel": "1",
      "cmtNm": "첫 번째 댓글입니다!",
      "createdDt": "20250119103000",
      "wrtrId": "user001",
      "wrtrNm": "김철수"        
    },
    {
      "pstNo": "B20240119112",
      "cmtNo": "C20240119112",
      "pstLevel": "1",
      "cmtNm": "두 번째 댓글입니다!",
      "createdDt": "20250119103000",
      "wrtrId": "user001",
      "wrtrNm": "김철수"
    },
    {
      "pstNo": "B20240119112",
      "cmtNo": "C20240119121",
      "pstLevel": "2",
      "cmtNm": "세 번째 댓글입니다!",
      "createdDt": "20250119103000",
      "wrtrId": "user001",
      "wrtrNm": "김철수"
    },
    {
      "pstNo": "B20240119113",
      "cmtNo": "C20240119113",
      "pstLevel": "1",
      "cmtNm": "네 번째 댓글입니다!",
      "createdDt": "20250119103000",
      "wrtrId": "user001",
      "wrtrNm": "김철수"        
    }
  ]
  ;


  let commentDatas2 = [
    {
      "pstNo": "B20240119111",
      "cmtNo": "C20240119111",
      "pstLevel": "1",
      "cmtNm": "1 번째 댓글입니다!",
      "createdDt": "20250119103000",
      "wrtrId": "user001",
      "wrtrNm": "김철수"        
    },
    {
      "pstNo": "B20240119112",
      "cmtNo": "C20240119112",
      "pstLevel": "1",
      "cmtNm": "2 번째 댓글입니다!",
      "createdDt": "20250119103000",
      "wrtrId": "user001",
      "wrtrNm": "김철수"
    },
    {
      "pstNo": "B20240119112",
      "cmtNo": "C20240119121",
      "pstLevel": "2",
      "cmtNm": "3 번째 댓글입니다!",
      "createdDt": "20250119103000",
      "wrtrId": "user001",
      "wrtrNm": "김철수"
    },
    {
      "pstNo": "B20240119113",
      "cmtNo": "C20240119113",
      "pstLevel": "1",
      "cmtNm": "4 번째 댓글입니다!",
      "createdDt": "20250119103000",
      "wrtrId": "user001",
      "wrtrNm": "김철수"        
    }
  ]
  
  