let quillEditor = undefined;

(function(){


    let TboardComponent = class {
        constructor() {
            this.cmp = {};

        }

        build(_viewType, _artclInfo) {
            if (_viewType === "writeType1") {
                console.log(_artclInfo);
                
                let artclNo = _artclInfo.artclNo;

                this.cmp[_viewType] = this.cmp[_viewType] ||{};

                let cmpKey = artclNo;
                let component = null;
                let isNewCmp = true;
                if (_artclInfo.cpt.indexOf("default") > -1) {
                    cmpKey = _artclInfo.cpt;
                    component = this.cmp[_viewType][cmpKey];
                    if (component) {
                        isNewCmp = false;
                    }
                }

                if (isNewCmp) {
                    this.cmp[_viewType][cmpKey] = new WriteComponent(_artclInfo);
                }
                else {
                    component[cmpKey](_artclInfo);
                }

            }
        }

        getData(_viewType) {
            let rtnData = [];
            Object.keys(this.cmp[_viewType]).forEach( _key => {
                let component = this.cmp[_viewType][_key];
                let data = component.getData();

                rtnData.push(data);
console.log(" ....rtnData " , rtnData);
            });
            return rtnData;
        }


    }


    let WriteComponent = class {
        constructor(_artclInfo) {
            this.artclInfo = _artclInfo;
            this.type      = this.artclInfo.cpt;
            this.artclNo   = this.artclInfo.artclNo;
            
            this.node = null;
            this.editor = null;
            this.elememnts = window.koshaTboard.tBoardElemProto.default.elements.writeType1;

            this.formEl  = {};
            this.config  = {};
            this.init();
        }

        init() {
            if (typeof this[ this.type ]=== "function") {

                //노드 복사
                this.node = this.elememnts.write[ this.type ].cloneNode(true);
                this.artclInfo.init = "testtesttesete";

                //노드 설정
                this[ this.type ]();
            }
        }

        addConfig() {
            debugger;

        }

        //기본값 세팅
        setInitValue(_node, _initValue) {
            if (!_node) {
                return;
            }

            if (_node.length > 0) {
                
            }

            switch(_node.nodeName) {
                case "INPUT":
                    if ("text" === _node.type.toLowerCase()) {
                        _node.value = _initValue;
                    }
                    else if ("radio" === _node.type.toLowerCase()) {
                        // 각 라디오 버튼을 순회하면서 값이 일치하면 해당 라디오 버튼을 체크
                        let radios = _node;
                        radios.forEach(radio => {
                            if (radio.value === _initValue) {
                                radio.checked = true;  // 해당 라디오 버튼을 체크 상태로 설정
                            } else {
                                radio.checked = false; // 나머지는 체크 해제
                            }
                        });
                    }

                    break;
                case "TEXTAREA":
                    _node.value = _initValue;
                    break;
                case "SELECT":
                    _node.value = _initValue;
                    break;
                case "radio":
                    element = document.createElement("input");
                    element.setAttribute("type", "date");
                    break;
                case "check":
                    element = document.createElement("input");
                    element.setAttribute("type", "checkbox");
                    break;
                case "date":
                    element = document.createElement("input");
                    element.setAttribute("type", "date");
                    break;
                default:
                    console.error("Unknown type:", this.type);
                    break;
            }
        }

        getData() {
            console.log(this.type);
            let rtnData = {
                artclNo : this.artclNo
                , data : {}
            };

            let value = "";
            let procNode = null;

            switch(this.type) {
                case "inputType1":
                    procNode = this.node.querySelector("input");
                    value = procNode.value;

                    break;
                case "editType1":
                    value = JSON.stringify(this.editor.getContents());
                    
                    break;
                case "textareaType1":
                    procNode = this.node.querySelector("textarea");
                    value = procNode.value;

                    break;
                case "selectType1":
                    procNode = this.node.querySelector("select");
                    value = procNode.value;

                    break;
                case "checkType1":
                    const checkedValues = Array.from(this.node.querySelectorAll(`input[name="${this.artclNo}"]:checked`))
                                            .map(checkbox => checkbox.value)
                                            .join('|');
                    value = checkedValues;

                    break;
                case "radioType1":
                    const checkedRadio = this.node.querySelector(`input[name=${this.artclNo}]:checked`);
                    if (checkedRadio) {
                        value = checkedRadio.value;
                    }

                    break;
                case "dateType1":
                    value = this.node.querySelector("input[type='date']").value || "";
                    value = value.replace(/-/g, "") || "";

                    break;
                case "dateperiodType1":
                    
                    let begin = this.node.querySelector("[data-tboard-id='begin']").value || "";
                    let end   = this.node.querySelector("[data-tboard-id='end']").value || "";

                    begin = begin.replace(/-/g, "");
                    end = end.replace(/-/g, "");

                    value = `${begin}|${end}`;

                    break;
                case "atachType1":
                    let fileNodes = this.node.querySelectorAll("input[type='file']");

                    const formData = new FormData();
                    
                    Array.from(fileNodes).forEach( fileNode => {
                        let files = fileNode.files;
                        if (files.length < 1) {
                            return;
                        }
                        formData.append(this.artclNo, files[0]);
                    });

                    console.log("-----------------------file");
                    for (let [key, value] of formData.entries()) {
                        console.log(`${key}`, value);
                    }
                    console.log("-----------------------file");

                    value = formData;
debugger;

                    break;

                default:

                    break;
            }

            rtnData.data = value;
            console.log("-------------------------", rtnData);

            return rtnData;
        }

        
        defaultType2(_artclInfo) {

            let artclInfo = _artclInfo || this.artclInfo;
debugger;
            if (Object.keys(this.formEl).length < 1) {
                let searchEls = this.node.querySelectorAll(`[data-tboard-fld-id]`);
                searchEls.forEach( el => {
                    this.formEl[ el.dataset.tboardFldId ] = el;
                    if ("SELECT" === this.formEl[ el.dataset.tboardFldId ].nodeName) {
                        this.formEl[ el.dataset.tboardFldId ].options.length = 0;
                    }
                    else if ("INPUT" === this.formEl[ el.dataset.tboardFldId ].nodeName) {
                        this.formEl[ el.dataset.tboardFldId ].value = "";                        
                    }
                });
            }
            //설정정보 추가
            this.config[ artclInfo.artclNo ] = artclInfo;


            if (artclInfo.src) {
                this.formEl.category.dataset.tboardArtclNo = artclInfo.artclNo;
                
                let codeList = bbsComCode.getCodeList(artclInfo.cct, artclInfo.src);
                Object.keys(codeList).forEach( _key => {
                    let code = _key;
                    let name = codeList[_key];
                    let option = document.createElement("option");
    
                    option.value = code;
                    option.textContent = name;
                    this.formEl.category.appendChild(option);
                });
                return;
            }

debugger;
            let option = document.createElement("option");
            option.value = artclInfo.artclNo;
            option.textContent = artclInfo.artclNo;

            this.formEl.searchOption.appendChild(option);
                

            if (artclInfo.all === "Y") {
                let option = document.createElement("option");
                option.value = "all";
                option.textContent = "전체";               
                
                this.formEl.searchOption.prepend(option);
            }
            debugger;
            console.log("defaultType2");
        }


        inputType1() {
            console.log("inputType1");

            let procNode = this.node.querySelector("input");

            //초기값
            if (this.artclInfo.init) {
                this.setInitValue(procNode, this.artclInfo.init);
            }
        }

        editType1() {
            console.log("editType1");
            let procNode = this.node.querySelector("[class='tboard-edit']");

            this.editor = new Quill(procNode, {
                theme: 'snow'  // Quill 테마
            });
            quillEditor = this.editor;
            //초기값
            if (this.artclInfo.init) {
                //this.editor.setText(this.artclInfo.init);

                const text = this.artclInfo.init;

                // Delta 형식으로 텍스트 변환
                const delta = this.editor.clipboard.convert(text);

                // Delta를 setContents()로 설정
                this.editor.setContents(delta);
            }
        }

        selectType1() {
            
            console.log("selectType1");

            //
            let procNode = this.node.querySelector("select");

            //옵션삭제
            while(procNode.firstChild) {
                procNode.firstChild.remove();
            }

            //공통코드 가져오기
            let codeList = bbsComCode.getCodeList(this.artclInfo.cct, this.artclInfo.src);

            Object.keys(codeList).forEach( _key => {
                let code = _key;
                let name = codeList[_key];
                let option = document.createElement("option");

                option.value = code;
                option.textContent = name;
                procNode.appendChild(option);
            });

            //등록시전체는 없음
            // this.artclInfo.all= "Y";
            // if (this.artclInfo.all === "Y") {
            //     let option = document.createElement("option");
            //     option.value = "all";
            //     option.textContent = "전체";
                
            //     방법1
            //     procNode.prepend(option);
            //     방법2
            //     procNode.insertBefore(option, procNode.firstElementChild);
            // }


            //초기값
            this.artclInfo.init = "CD00105";
            if (this.artclInfo.init) {
                this.setInitValue(procNode, this.artclInfo.init);
            }
        }

        radioType1() {


            /******************************** 라디오 복사에서 넣을 노드*/

            //그룹
            let grpNode = this.node.querySelector("[class='tboard-input']").cloneNode(true);

            //체크이름
            let labelNode = grpNode.querySelector("label").cloneNode(true);

            //라디오
            let radioNode = grpNode.querySelector("input[type='radio']").cloneNode(true);

            //삭제
            while(grpNode.firstChild) {
                grpNode.firstChild.remove();
            }

            /******************************** */

            //노드 삭제
            let delNodes = this.node.querySelectorAll(`[class="tboard-input"]`);
            // 찾은 노드들을 순차적으로 삭제합니다.
            delNodes.forEach(node => {
                node.remove();  // 해당 노드를 삭제합니다.
            });
            

            //라디오 객체 넣을 위치 기존
            let targetNode = this.node.querySelector(`[class="tboard-label"]`);

            //

            //공통코드 가져오기
            let codeList = bbsComCode.getCodeList(this.artclInfo.cct, this.artclInfo.src);
            Object.keys(codeList).forEach( _key => {
                let code = _key;
                let name = codeList[_key];
                
                let newGrp    = grpNode.cloneNode(true);
                let newLabel  = labelNode.cloneNode(true);
                let newRadio  = radioNode.cloneNode(true);

                newGrp.appendChild(newLabel);
                newGrp.appendChild(newRadio);

                newLabel.textContent = name;
                newRadio.value = code;

                newLabel.setAttribute("for", `${this.artclNo}_${code}`);
                newRadio.id   = `${this.artclNo}_${code}`;
                newRadio.name = `${this.artclNo}`;
                
                //
                targetNode.insertAdjacentElement('afterend', newGrp);
            });


            let initValue = this.artclInfo.init = "CD000206";
            if (this.artclInfo.init) {
                let radios = this.node.querySelectorAll(`input[name="${this.artclNo}"]`);
                radios.forEach(radio => {
                    if (radio.value === initValue) {
                        radio.checked = true;  // 해당 라디오 버튼을 체크 상태로 설정
                    } else {
                        radio.checked = false; // 나머지는 체크 해제
                    }
                });
            }
        }


        checkType1() {
            /******************************** 라디오 복사에서 넣을 노드*/

            //그룹
            let grpNode = this.node.querySelector("[class='tboard-input']").cloneNode(true);

            //체크이름
            let labelNode = grpNode.querySelector("label").cloneNode(true);

            //체크박스
            let checkNode = grpNode.querySelector("input[type='checkbox']").cloneNode(true);

            //삭제
            while(grpNode.firstChild) {
                console.log( grpNode.firstChild);
                grpNode.firstChild.remove();
            }

            /******************************** */

            //노드 삭제
            let delNodes = this.node.querySelectorAll(`[class="tboard-input"]`);
            // 찾은 노드들을 순차적으로 삭제합니다.
            delNodes.forEach(node => {
                node.remove();  // 해당 노드를 삭제합니다.
            });
            

            //라디오 객체 넣을 위치 기존
            //let targetNode = this.node.querySelector(`[class="tboard-label"]`);

            //


            //전체가 있으면
            this.artclInfo.all= "Y";
            if (this.artclInfo.all === "Y") {
                let newGrp    = grpNode.cloneNode(true);
                let newLabel  = labelNode.cloneNode(true);
                let newCheck  = checkNode.cloneNode(true);

                newGrp.appendChild(newLabel);
                newGrp.appendChild(newCheck);
                
                newLabel.textContent = "전체";
                newCheck.value = "all";
                newLabel.setAttribute("for", `${this.artclNo}_all`);

                newCheck.id   = `${this.artclNo}_all`;
                newCheck.name = `${this.artclNo}_all`;
                
                
                //첫번째자식노드
                this.node.insertAdjacentElement('beforeend', newGrp);
            }


            //공통코드 가져오기
            let codeList = bbsComCode.getCodeList(this.artclInfo.cct, this.artclInfo.src);
            Object.keys(codeList).forEach( _key => {
                let code = _key;
                let name = codeList[_key];
                
                let newGrp    = grpNode.cloneNode(true);
                let newLabel  = labelNode.cloneNode(true);
                let newCheck  = checkNode.cloneNode(true);

                newGrp.appendChild(newLabel);
                newGrp.appendChild(newCheck);

                newLabel.textContent = name;
                newCheck.value = code;

                newLabel.setAttribute("for", `${this.artclNo}_${code}`);
                newCheck.id   = `${this.artclNo}_${code}`;
                newCheck.name = `${this.artclNo}`;
                
                //
                this.node.insertAdjacentElement('beforeend', newGrp);
            });

            if (this.artclInfo.all === "Y") {
                // 전체 선택 체크박스를 클릭하면 다른 체크박스들도 모두 선택/해제
                const allCheckbox = this.node.querySelector(`input[id="${this.artclNo}_all`);
                const checkboxes  = this.node.querySelectorAll(`input[name="${this.artclNo}"]`);

                allCheckbox.addEventListener('change', () => {                    
                    checkboxes.forEach(checkbox => {
                        checkbox.checked = allCheckbox.checked;  // 전체 선택 체크박스의 상태로 설정
                    });
                });
                
                    // 개별 체크박스가 변경되면 전체 체크박스의 상태를 업데이트
                checkboxes.forEach(checkbox => {
                    checkbox.addEventListener('change', () => {
                        const allChecked = Array.from(checkboxes).every(checkbox => checkbox.checked);
                        const someChecked = Array.from(checkboxes).some(checkbox => checkbox.checked);
                        
                        // 전체 체크박스가 모두 선택되면 'checked' 상태로
                        allCheckbox.checked = allChecked;
                        
                        // 일부 체크박스만 선택되었을 때는 'indeterminate' 상태로 (부분 선택 표시)
                        allCheckbox.indeterminate = !allChecked && someChecked;
                    });
                });
            }



            this.artclInfo.init = "CD000306|CD000301" || "";
            let initValues = this.artclInfo.init.split("|");            
            let isAllChecked = false;
            if (this.artclInfo.init) {
                let checkboxes = this.node.querySelectorAll(`input[name*="${this.artclNo}"]`);
                isAllChecked = (this.artclInfo.init.toLowerCase().split("|")).includes("all");
                checkboxes.forEach(check => {
                    if (initValues.includes(check.value)) {
                        check.checked = true;  // 해당 라디오 버튼을 체크 상태로 설정
                    } else {
                        check.checked = false; // 나머지는 체크 해제
                    }

                    if (isAllChecked) {
                        check.checked = true;  // 해당 라디오 버튼을 체크 상태로 설정
                    }
                });
            }

        }

        dateType1() {
            console.log("dateType1");   
            
            let procNode = this.node.querySelector("input");

            //초기값
            this.artclInfo.init = "20241201";
            if (this.artclInfo.init) {
                
                let isYYYYMMDD  = "true";
                let isYYYYMM    = "true";
                let isYYYY      = "true";

                if (this.artclInfo.init.toLowerCase() === "today") {
                    if (isYYYYMMDD) {
                        const today = new Date();

                        // 년, 월, 일 추출
                        const yyyy = today.getFullYear();
                        const mm = (today.getMonth() + 1).toString().padStart(2, '0'); // 월은 0부터 시작하므로 +1을 해줍니다.
                        const dd = today.getDate().toString().padStart(2, '0');
                        const formattedDate = `${yyyy}-${mm}-${dd}`;
    
                        procNode.value = formattedDate;
                    }
                    else if (isYYYYMM) {

                    }
                    else if (isYYYY) {

                    }
                }
                else {
                    if (isYYYYMMDD) {
                        // 년, 월, 일 추출
                        let formattedDate = this.artclInfo.init.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
    
                        procNode.value = formattedDate;
                    }
                    else if (isYYYYMM) {

                    }
                    else if (isYYYY) {

                    }
                }
            }
            
        }

        dateperiodType1() {
            let procNode = this.node.querySelectorAll("input");

            let beginNode = procNode[0];
            let endNode   = procNode[1];

            beginNode.dataset.tboardId = "begin";
            endNode.dataset.tboardId = "end";

            this.artclInfo.init = "20241201|20241207";
            let initValue = this.artclInfo.init || "";
            if (initValue) {

                let beginInitValue =  "";
                let endInitValue = "";
                if (initValue.split("|").length > 1) {
                    beginInitValue = initValue.split("|")[0];
                    endInitValue   = initValue.split("|")[1];
                }
                
                let isYYYYMMDD  = "true";
                let isYYYYMM    = "true";
                let isYYYY      = "true";
                if (isYYYYMMDD) {
                    if (beginInitValue.length === 8) {
                        beginInitValue = beginInitValue.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'); 

                        beginNode.value = beginInitValue;
                    }

                    if (endInitValue.length === 8) {
                        endInitValue = endInitValue.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'); 

                        endNode.value = endInitValue;
                    }

                }
                else if (isYYYYMM) {
                    
                }
                else if (isYYYY) {
                    
                }
            }
            console.log("dateperiodType1");
        }

        textareaType1() {
            let procNode = this.node.querySelector("textarea");
            
            //초기값
            if (this.artclInfo.init) {
                this.setInitValue(procNode, this.artclInfo.init);
            }
            
            // let length = Number(this.artclInfo.len);
            // if (isNaN(length) === false && length > 0) {
            //     procNode.setAttribute("maxlength", length);  // 길이 제한
            // }

        }

        atachType1() {
            //항목 설정 정보
            let artclInfo = this.artclInfo;

            //첨부파일 설정
            let defaultConfig = {
                size: 100
                , cnt: 10
                , file: "xls|ppt"
            };

            let config = this.artclInfo.atch || defaultConfig;
            this.artclInfo.atch = config;

            let fileSizeNode  = this.node.querySelector(`[data-tboard-id="fileSize"]`);
            let fileExtNode   = this.node.querySelector(`[data-tboard-id="fileExt"]`);

            fileSizeNode.textContent = `파일 별 ${config.size}, 총 ${config.cnt}개 파일을 업로드 가능합니다.`;
            let fileType = config.file.split('|').map(ext => ext).join(', ');
            fileExtNode.textContent = `${fileType}`;

            //파일 추가 위치
            let fileGrp   = this.node.querySelector(`[data-tboard-fld-grp="atch"]`);

            //삭제
            while(fileGrp.firstChild) {
                fileGrp.firstChild.remove();
            }

            //파일추가(첫번째 파일)
            this.addFile();
            console.log("atachType1");
        }

        addFile() {
            let self = this;

            //파일그룹 위치
            let fileGrp   = this.node.querySelector(`[data-tboard-fld-grp="atch"]`);

            //마지막위치 노드
            let fileFldNodes = fileGrp.querySelectorAll(`[data-tboard-fld-type="atch.item"]`);
            //등록 된 전체 파일수
            let totalFileCnt = fileFldNodes.length;

            //설정
            let config = this.artclInfo.atch;

            //등록 가능 수 체크
            if (totalFileCnt >= config.cnt) {
                return;
            }

            //마지막 노드 파일이 비어있으면 패스
            if (totalFileCnt > 0) {
                let lastFileNode = fileFldNodes[totalFileCnt - 1].querySelector("input[type='file']");
                if (!lastFileNode.value) {
                    return;
                }
            }

            //추가할 파일 노드 그룹
            let newFileItem = this.elememnts.atch.item.cloneNode(true);
            let newFile     = newFileItem.querySelector("input[type='file']");
            let newFileNm   = newFileItem.querySelector(`[data-tboard-id="fileNm"]`);
            newFileNm.textContent = "";
            
            //accept 설정
            if (config.file) {
                let formattedTypes = config.file.split('|').map(ext => '.' + ext).join(',');
                newFile.setAttribute('accept', formattedTypes);
            }

            //파일그룹에 추가
            fileGrp.appendChild(newFileItem);


            //이벤트리스너 등록
            newFile.addEventListener('change', function(event) {
                //let fileGrp   = self.node.querySelector(`[data-tboard-fld-grp="atch"]`);
                
                //파일 수
                let itemCnt = fileGrp.querySelectorAll(`[data-tboard-fld-type="atch.item"]`).length;               
                
                // 선택된 파일 목록 가져오기
                let file = null;
                let files = event.target.files;                    
                
                if (files.length < 1) {
                    if (itemCnt !== 1) {
                        newFileItem.remove();
                    }
                    if (itemCnt === config.cnt) {
                        self.addFile();
                    }
                    return;
                }
                file = files[0];
                
                debugger;

                const fileName = file.name;
                const fileExtension = fileName.split('.').pop().toLowerCase();
          
                // 확장자 검사
                const allowedExtensions = config.file.split("|");
                if (!allowedExtensions.includes(fileExtension)) {
                    event.target.value = '';
                    return;
                }
                // 파일명
                newFileNm.textContent = fileName;
                
                if (itemCnt < config.cnt) {
                    let lastFileNode = fileGrp.querySelectorAll(`[data-tboard-fld-type="atch.item"]`)[itemCnt - 1];
                    if (lastFileNode.querySelector("input[type='file']").value) {
                        self.addFile();
                    }
                }
            });
        }
    }



    let Tboard = class { // 조회조건을 관리하는 객체 배열
        constructor(_tboardInfo) {
            //ajax
            //search,detail,write화면
            //search,detail,write타입
            //기능객체 : 게시판의 전체 기능
            //권한객체 : 사용자의 권한
            //항목객체 : 게시판 항목
            
            //화면생성객체 : search,detail,write 화면 생성
            //화면항목생성객체 : 항목객체로 화면 생성, 조회조건, 조회 결과 => 리스트 생성, 상세항목, 등록항목
                        
            //이벤트설정객체 : 화면타입별 이벤트리스너 연결
            //기능요청객체 : basic.access, basic.read => ajax 요청
            

            this.tAjax = new TboardAjax();
            this.koshaTboard = KOSHATboard.instance;
            this.bbsCmp = new TboardComponent();

            this.fullFldOptions = {};
            this.userFldOptions = {};
            

            this.fullOptions = {};
            this.userOptions = {};
            this.TboardViewManager = undefined;
            this.viewType = {
                search: "searchType1"
                , detail: "detailType1"
                , write: ""
            }

            this.view = {
                search: null
                , list: null
                , write:  null
                , detail: null
            };

            this.tboardViewEvent;
            this.tBoardHandler;
            //this.TBoardElemProto;
            //this.TBoardElem;

            //this.auth = {};
            //this.tagIdMap = {};
            //
            console.log("_tboardInfo : ", _tboardInfo);

            //this.searchDefaultArea = null;

            /*this.viewInfo = {
                search: {} //조회화면
                , detail: {} //상세화면
                , regist: {} //등록화면
            };*/

            //this.tboardSearchElement = new TboardSearchElement();
            //this.TBoardElem = new TboardElement();

            //this.searchConditions = {};
            //this.searchConditionsMap = {};
            //this.fieldInfos;

            this.init();
        }

        async init() {
            log.log("pos3");

            this.renderViewWrite();

            //기본권한체크
            //this.renderBbsView();

            //객체생성
            //this.createSearchCondition(datas);
            //화면추가
            //this.renderSearchCondition();

            //권한체크
            debugger;
            await this.checkPermission();





            //this.tboardViewManager = new TboardViewManager(this.fullOptions, this.userOptions);
            //debugger;
            //this.tboardViewEvent = new TboardViewEvent(this.viewType, this.tboardViewManager.bbsView);
            

return;
            let self = this;
            
            
            
            document.querySelector("[id='write']").addEventListener("click", function() {
                let datas = self.bbsCmp.getData("writeType1");

                let inputParam = {
                    artclGrid: []
                    , pstNm : ""
                    , pstCn : ""
                };

                let files = null;
                datas.forEach( _data => {
                    if ("C01" === _data.artclNo) {
                        inputParam.pstNm = _data.data;
                    }
                    else if ("C02" === _data.artclNo) {
                        inputParam.pstCn = _data.data;
                    }
                    else if ("C09" === _data.artclNo) {
                        files = _data.data;
                    }
                    else {
                        inputParam.artclGrid.push(_data);
                    }
                });

                let setting = {
                    isMultipart: true,
                    formData: files,
                    input: inputParam,
                    url: ""
                };
                
                debugger;

                self.tAjax.ajax(setting);
return;

                
                var formData = new FormData();
                formData.append('C09', files[0]); // 파일 추가
                formData.append('_JOSN', JSON.stringify({ key: 'value' })); // JSON 데이터 추가
                
                $.ajax({
                    url: 'http://localhost:8080/tboard/processMultiTboard.do',
                    method: 'POST',
                    data: formData,
                    processData: false,
                    contentType: false,
                    success: function(response) {
                        console.log('Success:', response);
                    },
                    error: function(xhr, status, error) {
                        console.error('Error:', error);
                    }
                });

                

            });



        }

        
        renderViewWrite() {
            this.view.write = window.koshaTboard.tBoardElemProto.default.elements.view.write.cloneNode(true);

            let atrclNoInfo = {
                "C01": {
                    title: "제목"
                },
                "C02": {
                    title: "내용"
                },
                "C03": {
                    title: "셀렉트"
                },
                "C04": {
                    title: "라디오"
                },
                "C05": {
                    title: "체크"
                },
                "C06": {
                    title: "데이트"
                },
                "C07": {
                    title: "데이트기간"
                },
                "C08": {
                    title: "텍스트"
                },
                "C09": {
                    title: "첨부"
                },
                "C10": {
                    title: "검색"
                },
                "C11": {
                    title: "제목"
                },
                "C12": {
                    title: "내용"
                }
            }

            let defaultInfo = {
                "C01": {
                    cpt: "inputType1",
                    init: "test"
                },
                "C02": {
                    cpt: "editType1",
                    lib: "quill"
                },
                "C03": {
                    cpt: "selectType1",
                    src: "C0001",
                    cct: "acm",                    
                    ini: "CD001"
                },
                "C04": {
                    cpt: "radioType1",
                    src: "C0002",
                    cct: "ast",
                    ini: "CD001"                    
                },
                "C05": {
                    cpt: "checkType1",
                    src: "C0003",
                    cct: "ast",
                    ini: "CD001",
                    all: "Y"
                },
                "C06": {
                    cpt: "dateType1",
                    title: "데이트",
                    ini: "202411101"
                },
                "C07": {
                    cpt: "dateperiodType1"

                },
                "C08": {
                    cpt: "textareaType1",
                    len: 4000
                },
                "C09": {
                    cpt: "atachType1",
                    atch: {
                        file: "txt|xls",
                        size: 10,
                        cnt: 5                        
                    }
                },
                "C10": {
                    cpt: "defaultType2",
                    src: "C0001",
                    cct: "acm"
                },
                "C11": {
                    cpt: "defaultType2",
                    all: "Y"
                },
                "C12": {
                    cpt: "defaultType2",
                    src: ""
                }
            };

            let sort = {
                1: "C01",
                2: "C02",
                3: "C08",
                4: "C03",
                5: "C06",
                6: "C07",
                7: "C04",
                8: "C05",
                9: "C09",
                10: "C10",
                11: "C11",
                12: "C12"
            }


            //컴포넌트 생성 한번만           
            Object.entries(sort).forEach(([_key, _value]) => {
                let artclNo = _value;
                let artclInfo = defaultInfo[artclNo];
                artclInfo.artclNo = artclNo;
                artclInfo.artclNm = atrclNoInfo[artclNo].title;

                this.bbsCmp.build("writeType1",  artclInfo);
                
                //this.bbsCmp.cmp[ artclNo ].node;
            });

            
debugger;

            Object.keys(this.bbsCmp.cmp.writeType1).forEach( _cmpKey => {
                // let cmpKey = artclNo;
                // if (artclInfo.cpt.indexOf("default") > -1) {
                //     cmpKey = _artclInfo.cpt;
                // }
    
    
                let fldKey = this.bbsCmp.cmp.writeType1[ _cmpKey ].node.dataset.tboardFldType;
                let grpKey = fldKey.split(".")[0];
    
                let grpNode = this.view.write.querySelector(`[data-tboard-fld-grp="${grpKey}"]`);


                grpNode.appendChild( this.bbsCmp.cmp.writeType1[ _cmpKey ].node );

            });







            //refresh - 다시 만들기
            // this.view.write = window.koshaTboard.tBoardElemProto.default.elements.view.write.cloneNode(true);
            // Object.entries(sort).forEach(([_key, _value]) => {
            //     let artclNo = _value;
            //     let artclInfo = defaultInfo[artclNo];
            //     artclInfo.artclNo = artclNo;
            //     artclInfo.artclNm = atrclNoInfo[artclNo].title;

            //     this.bbsCmp.build("writeType1",  artclInfo);

            //     let fldKey = this.bbsCmp.cmp.writeType1[ artclNo ].node.dataset.tboardFldType;
            //     let grpKey = fldKey.split(".")[0];

            //     //그룹노드에
            //     let grpNode = this.view.write.querySelector(`[data-tboard-fld-grp="${grpKey}"]`);
                
            //     //로우노드를 생성해서
            //     let rowNode = window.koshaTboard.tBoardElemProto.default.elements.writeType1.write.row.cloneNode(true);

            //     //컴포넌트를 추가하고
            //     rowNode.appendChild(this.bbsCmp.cmp.writeType1[ artclNo ].node);
                
            //     //그룹노드에 추가한다.
            //     grpNode.appendChild(rowNode);
                
            //     //this.bbsCmp.cmp[ artclNo ].node;
            // });

            debugger;
            //등록화면 추가
            let rootNode = document.querySelector('[data-tboard-id="tboard-root"]');
            while(rootNode.firstChild) {
                rootNode.firstChild.remove();
            }
            document.querySelector('[data-tboard-id="tboard-root"]').appendChild(this.view.write);

            



            //컴포넌트 화면 넣기
            Object.entries(sort).forEach(([_key, _value]) => {
            
            
            });
            
            
            





        }


        checkPermission() {
            let self = this;
            return new Promise((resolve, reject) => {
                
                let setting = {
                    url: "http://localhost:8080/tboard/processTboard.do"
                    , dataType: "json"
                    , successCallbackFn : function(_data) {

                        self.fullOptions = {};
                        self.userOptions = {};
                        self.fullFldOptions = {};
                        self.userFldOptions = {};
                        

                        // 데이터 순회
                        _data.rtnData.fullOptions.forEach(item => {
                            const { mainOptCode, prntOptCode, value } = item;

                            if (!prntOptCode) {
                                // prntOptCode가 없으면 mainOptCode를 키로 하여 객체 추가
                                self.fullOptions[mainOptCode] = value || self.fullOptions[mainOptCode] || {};
                            } else {
                                // prntOptCode가 있으면 prntOptCode 하위에 mainOptCode 객체 추가
                                if (!self.fullOptions[prntOptCode]) {
                                    self.fullOptions[prntOptCode] = {};  // prntOptCode가 없다면 해당 키를 추가
                                }
                                self.fullOptions[prntOptCode][mainOptCode] = value || self.fullOptions[prntOptCode][mainOptCode] || "";
                            }
                        });

                        // 데이터 순회
                        _data.rtnData.userOptions.forEach(item => {
                            const { optCd, hash } = item;

                            let fncOption = optCd.split(".")[0];
                            let prmOption = optCd.split(".")[1];
                            self.userOptions[fncOption] = self.userOptions[fncOption] || {};
                            self.userOptions[fncOption][prmOption] = hash;
                        });


                        // 데이터 순회
                        //50%, 100%

                        //list : width


                        _data.rtnData.artclList.forEach(item => {
                            if (item.resultType === "ALL") {
                                self.fullFldOptions[item.fldStngCd] = self.fullFldOptions[item.fldStngCd] || {};
                                self.fullFldOptions[item.fldStngCd][item.viewStngCd] = self.fullFldOptions[item.fldStngCd][item.viewStngCd] || {};
                                
                                self.fullFldOptions[item.fldStngCd][item.viewStngCd] = {...self.fullFldOptions[item.fldStngCd][item.viewStngCd], ...JSON.parse(item.fldStngCn)};

                                let objFldStng = JSON.parse(item.fldStngCn);
                                console.log(self.fullFldOptions);
                            }
                            else {

                                self.userFldOptions[item.fldStngCd] = self.userFldOptions[item.fldStngCd] || {};
                                self.userFldOptions[item.fldStngCd][item.viewStngCd] = self.userFldOptions[item.fldStngCd][item.viewStngCd] || {};
                                
                                self.userFldOptions[item.fldStngCd][item.viewStngCd] = {...self.userFldOptions[item.fldStngCd][item.viewStngCd], ...JSON.parse(item.fldStngCn)};

                                let objFldStng = JSON.parse(item.fldStngCn);
                                console.log(self.userFldOptions);


                            }

                            // let fncOption = optCd.split(".")[0];
                            // let prmOption = optCd.split(".")[1];
                            // self.artclOptions[fncOption] = self.userOptions[fncOption] || {};
                            // self.artclOptions[fncOption][prmOption] = hash;
                        });



                        console.log(self.fullFldOptions, self.userFldOptions);

                        resolve();
                    }
                    , errorCallbackFn : function () {
                        reject();
                    }
                }
                this.tAjax.ajax(setting);
            });
        }


        /*
            게시판 화면 기본 구성(기능/권한에 따른 화면 구성)
            1. 조회목록화면
                - 조회버튼
                - 등록 버튼
                - 페이징
            2. 등록/수정화면
                - 공지
                - 공지순서
                - 첨부파일
                - 비밀글
            3. 상세화면
                - 답글등록
                - 수정버튼
                - 삭제버튼
                - 댓글
                - 대댓글
        */

        renderBbsView() {

            this.koshaTboard.elememnt.default.searchType1;
            let fieldInfo = [
                {type: "defaultType1"
                    , sortSeq: 1
                    , info: {}
                }            
            ];




        }


            //조회버튼은 권한여부에 상관없이 보이도록 -> 누르면 권한 체크 후 알림
            //상세 -> 클릭 시 권한체크
            //첨부파일 -> 클릭 시 퀀한체크
            //수정/등록버튼
            //답글등록, 수정
            //댓글
            //대댓글

            //권한에 따라 화면에 보임/안보임 처리 할 컴포넌트

            //권한에 따라 화면에 보이지만 알림으로 처리 할 컴포넌트


        createSearchCondition(_datas) {
            //조회조건 객체
            _datas.forEach( (data, index) => {
                let element   = this.tboardSearchElement.create(data.type);
                let elementId = String(performance.now());

                //데이터 css 적용한 조회조건
                this.searchConditions[elementId] = new SearchCondition({element, data});
                this.searchConditionsMap[index] = elementId;
            });

        }

        renderSearchCondition() {
            this.searchDefaultArea = this.getSearchDefaultArea()
            this.searchDefaultArea.appendChild(this.searchConditions[ this.searchConditionsMap[0] ].element );
        }

        getSearchDefaultArea(searchRow) {
            const searchDefaultArea = "searchDefaultArea";
            const searchArea = document.querySelector(`[data-tboard-id="${searchDefaultArea}"]`);
            return searchArea;
        }
    }


    var TBoardHandler = class {
        constructor() {
            this.basic = new this.basic(this);
            this.reply = new this.reply(this);
            this.comment = new this.comment(this);
            this.replycomment = new this.replycomment(this);
            this.attach = new this.attach(this);
            this.notice = new this.notice(this);

            this.page = 1; // 현재 페이지
            this.pageSize = 10; // 페이지당 아이템 수
            this.totalItems = 0; // 전체 아이템 수
        }

        
        basic = class {
            constructor(_outerInstance) {
                this.handler = _outerInstance;  // 외부 클래스 인스턴스를 저장
            }

            access() {
                alert("조회권한이 없습니다.")
            }

            read() {

            }

            save() {
             

            }

            delete() {
         
            }
        }

        reply = class {
            constructor(_outerInstance) {
                this.viewManager = _outerInstance;  // 외부 클래스 인스턴스를 저장
            }

            access() {
                
     
            }

            read() {

            }

            save() {
             

            }

            delete() {
         
            }
        }

        comment = class {
            constructor(_outerInstance) {
                this.viewManager = _outerInstance;  // 외부 클래스 인스턴스를 저장
            }
            read() {

            }

            save() {
             

            }

            delete() {
         
            }
        }

        replycomment = class {
            constructor(_outerInstance) {
                this.viewManager = _outerInstance;  // 외부 클래스 인스턴스를 저장
            }
            read() {

            }

            save() {
             

            }

            delete() {
         
            }
        }

        attach = class {
            constructor(_outerInstance) {
                this.viewManager = _outerInstance;  // 외부 클래스 인스턴스를 저장
            }

            upload() {

            }

            download() {

            }
        }

        notice = class {
            constructor(_outerInstance) {
                this.viewManager = _outerInstance;  // 외부 클래스 인스턴스를 저장
            }

            save() {

            }
        }

    }


    // class PaginationManager {
    //     constructor(totalItems, pageSize) {
    //         this.totalItems = totalItems;
    //         this.pageSize = pageSize;
    //         this.currentPage = 1;
    //     }

    //     // 현재 페이지 계산
    //     getTotalPages() {
    //         return Math.ceil(this.totalItems / this.pageSize);
    //     }

    //     // 페이지 이동
    //     goToPage(pageNumber) {
    //         if (pageNumber > 0 && pageNumber <= this.getTotalPages()) {
    //             this.currentPage = pageNumber;
    //             console.log(`페이지 ${this.currentPage}로 이동`);
    //         } else {
    //             console.log("잘못된 페이지 번호");
    //         }
    //     }
    // }


    let TboardViewEvent = class {
        constructor(_viewType, _bbsView) {
            this.viewType = _viewType;
            this.viewNodes = _bbsView;
            
            this.tboardHandler = new TBoardHandler();

            this.bind();
        }
        
        
        bind() {
            Object.keys(this.viewType).forEach( _key => {
                let eventType = this.viewType[ _key ];
                if (typeof this[eventType]  === "function") {
                    this[eventType]( _key );
                }
            });

        }

        searchType1(_key) {
            let viewNode  = this.viewNodes[_key];
            let eventNode = viewNode.querySelector(`[data-tboard-id="btnSearch"]`);
            if (eventNode instanceof HTMLElement) {
                eventNode.addEventListener("click", () => {this.tboardHandler.basic.access();});            
            }

            /*
            const generalView = new GeneralView();
            document.getElementById("generalSearchButton").addEventListener("click", () => generalView.onSearchButtonClick());
            document.querySelectorAll(".generalItem").forEach(item => {
                item.addEventListener("click", () => generalView.onItemClick(item.dataset.id));
            });*/
            

        }


        detailType1() {
            
        }

        write() {


        }

        basic = class {
            constructor(_outerInstance) {
                this.viewManager = _outerInstance;  // 외부 클래스 인스턴스를 저장
            }

            init() {
                console.log("Basic class initialized");
            }

            manage(_isPermission) {
                console.log("Basic manage called : ", _isPermission);
                //권한이 있으면 처리하는 로직
                if (_isPermission === true) {


                    return;
                }

                 //권한이 없어도 처리하는 로직

            }

            access(_isPermission) {
     
            }

            read(_isPermission) {
                console.log("Basic read called : ", _isPermission);

                //권한이 있으면 처리하는 로직
                if (_isPermission === true) {


                    return;
                }

                 //권한이 없어도 처리하는 로직



            }

            save(_isPermission) {
                console.log("Basic save called : ", _isPermission);
                //권한이 있으면 처리하는 로직
                if (_isPermission === true) {


                    return;
                }

                 //권한이 없어도 처리하는 로직

            }

            delete(_isPermission) {
                console.log("Basic delete called", _isPermission);
                //권한이 있으면 처리하는 로직
                if (_isPermission === true) {


                    return;
                }

                 //권한이 없어도 처리하는 로직

            }
        }

        reply = class {
            constructor(_outerInstance) {
                this.viewManager = _outerInstance;  // 외부 클래스 인스턴스를 저장
            }

            init() {
                console.log("Reply class initialized");
            }

            manage(_isPermission) {
                console.log("Reply manage called : ", _isPermission);

                //권한이 있으면 처리하는 로직
                if (_isPermission === true) {


                    return;
                }

                 //권한이 없어도 처리하는 로직

            }


            access(_isPermission) {
                console.log("Reply access called : ", _isPermission);

                //권한이 있으면 처리하는 로직
                if (_isPermission === true) {


                    return;
                }

                 //권한이 없어도 처리하는 로직



            }

            read(_isPermission) {
                console.log("Reply read called", _isPermission);

                //권한이 있으면 처리하는 로직
                if (_isPermission === true) {


                    return;
                }

                 //권한이 없어도 처리하는 로직


                 
            }

            save(_isPermission) {
                console.log("Reply save called", _isPermission);

                //권한이 있으면 처리하는 로직
                if (_isPermission === true) {


                    return;
                }

                 //권한이 없어도 처리하는 로직


            }

            delete(_isPermission) {
                console.log("Reply delete called", _isPermission);

                //권한이 있으면 처리하는 로직
                if (_isPermission === true) {


                    return;
                }

                 //권한이 없어도 처리하는 로직


            }
        }

        comment = class {
            constructor(_outerInstance) {
                this.viewManager = _outerInstance;  // 외부 클래스 인스턴스를 저장
            }

            init() {
                console.log("Comment class initialized");
            }

            manage(_isPermission) {
                console.log("Comment manage called : ", _isPermission);

                //권한이 있으면 처리하는 로직
                if (_isPermission === true) {


                    return;
                }

                 //권한이 없어도 처리하는 로직



            }


            read(_isPermission) {
                console.log("Comment read called : ", _isPermission);

                //권한이 있으면 처리하는 로직
                if (_isPermission === true) {


                    return;
                }

                 //권한이 없어도 처리하는 로직


            }

            save(_isPermission) {
                console.log("Comment save called : ", _isPermission);


                //권한이 있으면 처리하는 로직
                if (_isPermission === true) {


                    return;
                }

                 //권한이 없어도 처리하는 로직


            }

            delete(_isPermission) {
                console.log("Comment delete called : ", _isPermission);


                //권한이 있으면 처리하는 로직
                if (_isPermission === true) {


                    return;
                }

                 //권한이 없어도 처리하는 로직


            }
        }

        replycomment = class {
            constructor(_outerInstance) {
                this.viewManager = _outerInstance;  // 외부 클래스 인스턴스를 저장
            }

            init() {
                console.log("Replycomment class initialized");
            }


            manage(_isPermission) {
                console.log("Replycomment manage called : ", _isPermission);

                //권한이 있으면 처리하는 로직
                if (_isPermission === true) {

                    return;
                }

                 //권한이 없어도 처리하는 로직



            }

            read(_isPermission) {
                console.log("Replycomment read called : ", _isPermission);


                //권한이 있으면 처리하는 로직
                if (_isPermission === true) {


                    return;
                }

                 //권한이 없어도 처리하는 로직


            }

            save(_isPermission) {
                console.log("Replycomment save called : ", _isPermission);

                //권한이 있으면 처리하는 로직
                if (_isPermission === true) {


                    return;
                }

                 //권한이 없어도 처리하는 로직


            }

            delete(_isPermission) {
                console.log("Replycomment delete called : ", _isPermission);

                //권한이 있으면 처리하는 로직
                if (_isPermission === true) {


                    return;
                }

                 //권한이 없어도 처리하는 로직


            }

        }

        attach = class {
            constructor(_outerInstance) {
                this.viewManager = _outerInstance;  // 외부 클래스 인스턴스를 저장
            }

            init() {
                console.log("Attach class initialized");
            }

            manage(_isPermission) {
                console.log("Attach manage called : ", _isPermission);


            }

            upload(_isPermission) {
                console.log("Attach upload called : ", _isPermission);

                //권한이 있으면 처리하는 로직
                if (_isPermission === true) {


                    return;
                }

                 //권한이 없어도 처리하는 로직


            }

            download(_isPermission) {
                console.log("Attach download called : ", _isPermission);

                //권한이 있으면 처리하는 로직
                if (_isPermission === true) {


                    return;
                }

                 //권한이 없어도 처리하는 로직


            }
        }

        notice = class {
            constructor(_outerInstance) {
                this.viewManager = _outerInstance;  // 외부 클래스 인스턴스를 저장
            }

            init() {
                console.log("Notice class initialized");
            }

            manage(_isPermission) {
                console.log("Notice manage called : ", _isPermission);

                //권한이 있으면 처리하는 로직
                if (_isPermission === true) {                    
                    return;
                }

                 //권한이 없어도 처리하는 로직

            }

            save(_isPermission) {
                console.log("Notice save called : ", _isPermission);

                //권한이 있으면 처리하는 로직
                if (_isPermission === true) {


                    return;
                }

                 //권한이 없어도 처리하는 로직

            }
        }
    }


    let TboardViewManager = class {
        constructor(_fullOptions, _userOptions) {
            this.koshaTboard = KOSHATboard.instance;

            this.fullOptions = JSON.parse(JSON.stringify(_fullOptions));
            this.userOptions = JSON.parse(JSON.stringify(_userOptions));

            this.bbsOption = new this.bbsOption(this);
            this.basic = new this.basic(this);
            this.reply = new this.reply(this);
            this.comment = new this.comment(this);
            this.replycomment = new this.replycomment(this);
            this.attach = new this.attach(this);
            this.notice = new this.notice(this);

            this.bbsView = {};
            this.bbsViewTemp = this.koshaTboard.getView();

            this.setView();


            ////////////////////////////////

            

            document.querySelector(`[data-tboard-id="tboard-root"]`).append(this.bbsView.search);
        }

        hasPermission(_objPermission) {
            let fncOpt = _objPermission.fncOpt;
            let prmOpt = _objPermission.prmOpt;
            let manageOpt = "manage";
            let isRtnFlag = false;
            try {
                //관리자 권한이 있는지
                if (this.userOptions[fncOpt][manageOpt]) {
                    isRtnFlag = true;
                }
                
                if (this.userOptions[fncOpt][prmOpt]) {
                    isRtnFlag = true;
                }
            }
            catch(error) {
                isRtnFlag = false;
            }
            return isRtnFlag;
        }

        setViewDisplay(_auth) {

            Object.keys(this.bbsView).forEach(_key => {
                let viewNode = this.bbsView[ _key ];

                let authNodes = viewNode.querySelectorAll(`[data-tboard-auth-type="${_auth}"]`);
                Array.from(authNodes).forEach( _authNode => {
                    _authNode.style.display = "";
                });
                
                //authNodes[0].style.display = "block";

                //button.style.display = 'inline-block'; 

            });
        }


        setView() {

            //권한없는 기능 먼저 실행
            Object.keys(this.fullOptions).forEach(_fncOptKey => {
                if (typeof this.fullOptions[ _fncOptKey ] !== "object") {
                    //기능옵션 실행
                    if (typeof this.bbsOption[_fncOptKey] === "function") {
                        let value = this.fullOptions[ _fncOptKey ];
                        this.bbsOption[_fncOptKey]( value );
                    }
                }
            });

            //권한에 매핑된 기능 실행
            Object.keys(this.fullOptions).forEach(_fncOptKey => {

                let objFunctionOption = this.fullOptions[ _fncOptKey ];
                if (typeof objFunctionOption !== "object") {
                    return;
                }

                //기능옵션 실행(basic, reply, comment, replycomment, notice, attach)
                if (typeof this[_fncOptKey] === "object" && this[_fncOptKey].init === "function") {
                    this[_fncOptKey].init();
                }

                //access, read, save, delete, upload, download
                Object.keys( objFunctionOption ).forEach(_prmOptKey => {
                    let optKey = `${_fncOptKey}.${_prmOptKey}`;
                    
                    //권한옵션 실행(일반실행)
                    if (typeof this[_fncOptKey][_prmOptKey] === "function") { //basic.manage, basic.access....
                        this[_fncOptKey][_prmOptKey](false, optKey);
                    }

                    //권한옵션 실행(권한실행)
                    if (this.hasPermission({fncOpt: _fncOptKey, prmOpt: _prmOptKey})) {
                        this[_fncOptKey][_prmOptKey](true, optKey);

                        this.setViewDisplay(`${_fncOptKey}.${_prmOptKey}`);
                    }

                });

                
            });
        }

        bbsOption = class {
            constructor(_outerInstance) {
                this.viewManager = _outerInstance;  // 외부 클래스 인스턴스를 저장
            }

            bbstype(_value) {
                console.log("bbstype access initialized : ", _value);
                let config = {
                    list : {
                        search: "searchType1"
                        , detail: "detailType1"
                        , write: "write"
                    },
                    gallery  : {
                        search: "searchType2"
                        , detail: "detailType2"
                        , write: "write"
                    },
                    faq : {
                        search: ""
                        , detail: ""
                        , write: "write"
                    }
                }

                if (_value === "list") {
                    let objViewMap = config[_value];
                    

                    Object.keys(objViewMap).forEach( _key => {
                        let viewName = objViewMap[_key];
                        let viewNode = this.viewManager.bbsViewTemp[viewName];

                        if (viewNode instanceof HTMLElement) {
                            this.viewManager.bbsView[ _key ] = viewNode.cloneNode(true);
                        }
                    });
                }
            }
            treereply(_value) {
                console.log("treereply access initialized", _value);
            }
            confirm(_value) {
                console.log("treereply access initialized", _value);
            }
        }


        //

        basic = class {
            constructor(_outerInstance) {
                this.viewManager = _outerInstance;  // 외부 클래스 인스턴스를 저장
            }

            init() {
                console.log("Basic class initialized");
            }

            manage(_isPermission, _optKey) {
                console.log("Basic manage called : ", _isPermission);
                //권한이 있으면 처리하는 로직
                if (_isPermission === true) {


                    return;
                }

                 //권한이 없어도 처리하는 로직

            }

            access(_isPermission, _optKey) {
                console.log("Basic access called : ", _isPermission);
                //권한이 있으면 처리하는 로직
                if (_isPermission === true) {

                    return;
                }
                 
            }

            read(_isPermission, _optKey) {
                console.log("Basic read called : ", _isPermission);

                //권한이 있으면 처리하는 로직
                if (_isPermission === true) {


                    return;
                }

                 //권한이 없어도 처리하는 로직



            }

            save(_isPermission, _optKey) {
                console.log("Basic save called : ", _isPermission);
                //권한이 있으면 처리하는 로직
                if (_isPermission === true) {


                    return;
                }

                 //권한이 없어도 처리하는 로직

            }

            delete(_isPermission, _optKey) {
                console.log("Basic delete called", _isPermission);
                //권한이 있으면 처리하는 로직
                if (_isPermission === true) {


                    return;
                }

                 //권한이 없어도 처리하는 로직

            }
        }

        reply = class {
            constructor(_outerInstance) {
                this.viewManager = _outerInstance;  // 외부 클래스 인스턴스를 저장
            }

            init() {
                console.log("Reply class initialized");
            }

            manage(_isPermission, _optKey) {
                console.log("Reply manage called : ", _isPermission);

                //권한이 있으면 처리하는 로직
                if (_isPermission === true) {


                    return;
                }

                 //권한이 없어도 처리하는 로직

            }


            access(_isPermission, _optKey) {
                console.log("Reply access called : ", _isPermission);

                //권한이 있으면 처리하는 로직
                if (_isPermission === true) {


                    return;
                }

                 //권한이 없어도 처리하는 로직



            }

            read(_isPermission, _optKey) {
                console.log("Reply read called", _isPermission);

                //권한이 있으면 처리하는 로직
                if (_isPermission === true) {


                    return;
                }

                 //권한이 없어도 처리하는 로직


                 
            }

            save(_isPermission, _optKey) {
                console.log("Reply save called", _isPermission);

                //권한이 있으면 처리하는 로직
                if (_isPermission === true) {


                    return;
                }

                 //권한이 없어도 처리하는 로직


            }

            delete(_isPermission, _optKey) {
                console.log("Reply delete called", _isPermission);

                //권한이 있으면 처리하는 로직
                if (_isPermission === true) {


                    return;
                }

                 //권한이 없어도 처리하는 로직


            }
        }

        comment = class {
            constructor(_outerInstance) {
                this.viewManager = _outerInstance;  // 외부 클래스 인스턴스를 저장
            }

            init() {
                console.log("Comment class initialized");
            }

            manage(_isPermission, _optKey) {
                console.log("Comment manage called : ", _isPermission);

                //권한이 있으면 처리하는 로직
                if (_isPermission === true) {


                    return;
                }

                 //권한이 없어도 처리하는 로직



            }


            read(_isPermission, _optKey) {
                console.log("Comment read called : ", _isPermission);

                //권한이 있으면 처리하는 로직
                if (_isPermission === true) {


                    return;
                }

                 //권한이 없어도 처리하는 로직


            }

            save(_isPermission, _optKey) {
                console.log("Comment save called : ", _isPermission);


                //권한이 있으면 처리하는 로직
                if (_isPermission === true) {


                    return;
                }

                 //권한이 없어도 처리하는 로직


            }

            delete(_isPermission, _optKey) {
                console.log("Comment delete called : ", _isPermission);


                //권한이 있으면 처리하는 로직
                if (_isPermission === true) {


                    return;
                }

                 //권한이 없어도 처리하는 로직


            }
        }

        replycomment = class {
            constructor(_outerInstance) {
                this.viewManager = _outerInstance;  // 외부 클래스 인스턴스를 저장
            }

            init() {
                console.log("Replycomment class initialized");
            }


            manage(_isPermission, _optKey) {
                console.log("Replycomment manage called : ", _isPermission);

                //권한이 있으면 처리하는 로직
                if (_isPermission === true) {

                    return;
                }

                 //권한이 없어도 처리하는 로직



            }

            read(_isPermission, _optKey) {
                console.log("Replycomment read called : ", _isPermission);


                //권한이 있으면 처리하는 로직
                if (_isPermission === true) {


                    return;
                }

                 //권한이 없어도 처리하는 로직


            }

            save(_isPermission, _optKey) {
                console.log("Replycomment save called : ", _isPermission);

                //권한이 있으면 처리하는 로직
                if (_isPermission === true) {


                    return;
                }

                 //권한이 없어도 처리하는 로직


            }

            delete(_isPermission, _optKey) {
                console.log("Replycomment delete called : ", _isPermission);

                //권한이 있으면 처리하는 로직
                if (_isPermission === true) {


                    return;
                }

                 //권한이 없어도 처리하는 로직


            }

        }

        attach = class {
            constructor(_outerInstance) {
                this.viewManager = _outerInstance;  // 외부 클래스 인스턴스를 저장
            }

            init() {
                console.log("Attach class initialized");
            }

            manage(_isPermission, _optKey) {
                console.log("Attach manage called : ", _isPermission);


            }

            upload(_isPermission, _optKey) {
                console.log("Attach upload called : ", _isPermission);

                //권한이 있으면 처리하는 로직
                if (_isPermission === true) {


                    return;
                }

                 //권한이 없어도 처리하는 로직


            }

            download(_isPermission, _optKey) {
                console.log("Attach download called : ", _isPermission);

                //권한이 있으면 처리하는 로직
                if (_isPermission === true) {


                    return;
                }

                 //권한이 없어도 처리하는 로직


            }
        }

        notice = class {
            constructor(_outerInstance) {
                this.viewManager = _outerInstance;  // 외부 클래스 인스턴스를 저장
            }

            init() {
                console.log("Notice class initialized");
            }

            manage(_isPermission, _optKey) {
                console.log("Notice manage called : ", _isPermission);

                //권한이 있으면 처리하는 로직
                if (_isPermission === true) {                    
                    return;
                }

                 //권한이 없어도 처리하는 로직

            }

            save(_isPermission, _optKey) {
                console.log("Notice save called : ", _isPermission);

                //권한이 있으면 처리하는 로직
                if (_isPermission === true) {


                    return;
                }

                 //권한이 없어도 처리하는 로직

            }
        }

    }






    //KOSHATboard는 하나만 instance 생성
    //가장 상위의 객체 -> 라이브러리, css등을 로드함
    //사용자는 KOSHATboard.init 사용 => 게시판 생성
    //게시판 생성 후 설정정보(config)는 게시판 별 다를 수 있음
    var KOSHATboard = class {
        static instance;
        constructor() {
            //값이 있으면 있는값 리턴
            if (KOSHATboard.instance) {
                return KOSHATboard.instance;
            }
            //값이 없으면 없으면 객체 입력
            KOSHATboard.instance = this;

            this.tBoardElemProto = {
                default: {}
            };

            //설정 값
            this.config = {
                default: {}
            };

            //게시판 html 객체
            this.elememnt = {
                default: {}
            };

            //유니크 아이디 별 게시판객체
            this.bbsInfo = {};

            //ajax 객체 생성
            this.tAjax = new TboardAjax();
//debugger;
            this.#createTboardConfig(); //설정값 세팅
            this.#createTBoardElemProto(); //기본html요소 세팅

            //Load Resource
            this.#loadResource() //리소스로드
            .then(() => {
                console.log("completed web resource");
//debugger;
                this.#setTBoardElemProto();
                //this.#setTBoardElemProto(); //기본html요소 세팅

                this.init();
            })
            .catch((error) => {
                console.log("error : ", error);
            })

            ;
            //
            //
            //this.bbsId = _args.bbsId;
            //this.#setTboardConfig();
            //this.#setTBoardElemProto();
        }

        getView() {
            return this.elememnt.default.view;
        }

        async #loadResource() {

            let arrResourcePromise = [],
            loadScript = () => {
                //에디터, 피커 등
            },
            loadStyle = () => {
                //css
            },
            loadHTML = (_htmlUrl) => {
                Object.keys(this.config).forEach(_tboardType => {
                    let ojbHtml = this.config[ _tboardType ].resource.html;

                    Object.keys(ojbHtml).forEach(_htmlType => {
                        let htmlUrl = ojbHtml[ _htmlType ];
                        if (!htmlUrl) {
                            return;
                        }

                        let promiseFn = new Promise((resolve, reject) => {
                            let ajaxSetting = {
                                url: htmlUrl,
                                type: "GET",
                                dataType: "html",
                                successCallbackFn: function(_data) {
                                    try {
                                        let document = parseStringToDom(_data);
                                        removeScriptTag(document);
                                        resolve({tboardType: _tboardType, procType: "html", htmlType: _htmlType, dom : document});
                                    }
                                    catch(error) {
                                        reject(error);
                                    }
                                },
                                errorCallbackFn: function(_xhr) {
                                    reject({_tboardType, _htmlType, _xhr});
                                },
                                completeCallbackFn: function() {
                                    //debugger;
                                }
                            }

                            this.tAjax.ajax(ajaxSetting);
                        });

                        arrResourcePromise.push(promiseFn);
                    });
                });
            },
            parseStringToDom = (_strHtml) => {
                //let rootElemnet = document.createElement("div");
                return new DOMParser().parseFromString(_strHtml, 'text/html');
            },
            removeScriptTag = (_document) => {
                var scripts = _document.querySelectorAll('script');
                scripts.forEach(function(script) {
                    script.parentNode.removeChild(script);
                });
            }

            loadScript();
            loadStyle();
            loadHTML();

            return Promise.all(arrResourcePromise)
            .then((arrResource)=> {
                arrResource.forEach((resource) => {
                    let tboardType = resource.tboardType;
                    let procType = resource.procType;
                    let htmlType = resource.htmlType;
                    let dom = resource.dom;

                    if (procType.toLowerCase() === "html") {
                        //this.elememnt.default.html. /search/detail/write
                        this.elememnt[ tboardType ][ procType ][ htmlType ] = dom;
                    }
                });

                //this.elememnt;
                //arrResource[0].document.querySelector(`[data-tboard-id="tboard-root"]`)
            })
            .catch(error => {
                throw new Error("error : loadResource ");
            });
        }

        //private
        #createTboardConfig() {
            Object.keys(this.config).forEach(_type => {
                this.config[_type] = new TboardConfig( _type ).config;
            });
        }

        #createTBoardElemProto() {
            Object.keys(this.elememnt).forEach(_type => {
                this.tBoardElemProto[_type] = new TboardElementPrototype( _type );
                this.elememnt[_type] = new TboardElementPrototype( _type ).elements;
            });
        }

        #setTBoardElemProto() {
            Object.keys(this.elememnt).forEach(_type => {
                this.tBoardElemProto[_type].init();
                //this.elememnt[_type].init();
            });
        }

        //게시판 생성
        init(_args) {
            // _args = _args || {};
            // let type = _args.type || "default";


            // const tboard = new Tboard(_args);
            //객체 생성
            //let uniqBbsId = this.generateUniqueId();
            //this.bbsInfo[uniqBbsId] = new Tboard(boardDatas, uniqBbsId);
        }

        generateUniqueId() {
            return Date.now() + '-' + Math.floor(Math.random() * 10000);
        }
    },
    TboardAjax = class {
        static instance;
        constructor() {
            //값이 있으면 있는값 리턴
            if (TboardAjax.instance) {
                return TboardAjax.instance;
            }
            //값이 없으면 없으면 객체 입력
            TboardAjax.instance = this;
        }

        createAjax() {
            return new this.ajaxProto();
        }


        ajax(_setting) {
            let ajax = this.createAjax();
            ajax.setAjaxSetting(_setting);
            ajax.execute();
        }

        /*
        ajaxScript(_setting) {
            let ajax = this.createAjax();
            ajax.setAjaxSetting(_setting);
            ajax.execute();
        }

        ajaxStyle(_setting) {
            let ajax = this.createAjax();
            ajax.setAjaxSetting(_setting);
            ajax.execute();
        }*/


        ajaxProto = class {
            constructor() {
                this.uuid = "";
                this.type = "POST";
				this.url = "requestProcess.do";
                this.async = true;
				this.cache = true;
				this.dataType = "text"; //html,script,json,text,xml
                this.contentType = "";
				this.successCallbackFn = undefined;
				this.errorCallbackFn = undefined;
				this.completeCallbackFn = undefined;
                this.beforeSendFn = undefined;
                this.isMultipart = false;
                this.formData = null;
                this.fileData = {};
                this.input = {};
            }

            setBeforeSend(_beforeSendFn) {
                this.beforeSendFn = beforeSendFn;
            }

            setAjaxSetting(_setting) {
                Object.keys(_setting).forEach( _key => {
                    if (this.hasOwnProperty(_key) === false) {
                        return;
                    }
                    this[_key] = _setting[_key];
                });
            }

			setCommonParam() {
				return {
					frontInfo: {
						viewId: "",
						menuId: ""
					},
					frontAuthKey: "",
					auth: {

					},
					securityInfo: "",
					data: {

					}
				}
			};

			setServiceParam() {
				return {
					info: {
						id   : this.svcId,
						type : ""
					},
					data: this.input || {}
				}
			};


            setParam() {
                let encParam = {};
				if (this.type.toUpperCase() === 'POST') {
					let param = {
						common  : this.setCommonParam(),
						service : this.setServiceParam()
					};

					try {
						encParam = { "_JSON": encodeURIComponent(JSON.stringify(param)) };
					} catch (e) {
						encParam = { "_JSON": encodeURIComponent("{}") };
					}
				}
                return encParam;
            }

            setFormData() {
                let param = {
                    common  : this.setCommonParam(),
                    service : this.setServiceParam()
                };
                try {
                    this.formData.append( "_JSON", encodeURIComponent(JSON.stringify(param)));
                } catch (e) {
                    this.formData.append( "_JSON", encodeURIComponent(JSON.stringify({})));
                }

                return this.formData;
            }
            


			execute() {
                let setting = {};
                let _ajaxSelf = this;
				let inputParam = "";
                if (this.isMultipart) {
                    inputParam = this.setFormData();
                    _ajaxSelf.url = "http://localhost:8080/tboard/processMultiTboard.do";

                    console.log("------------------------------*");

                    inputParam.forEach((value, key) => {
                        console.log(`${key}`, value);
                    });

                    console.log("------------------------------*");
                    debugger;




                    setting = {
                        type : _ajaxSelf.type || "POST",
                        url : _ajaxSelf.url,
                        data : inputParam,
                        processData: false, // jQuery가 데이터를 자동으로 처리하지 않도록 설정
                        contentType: false, // 파일 전송 시의 Content-Type을 자동으로 설정하지 않도록 설정
                        beforeSend: function(xhr) {
                            //xhr.setRequestHeader("Cache-Control", "max-age=0")
                            if (typeof this.beforeSendFn === "function") {
                                _ajaxSelf.beforeSendFn(xhr);
                            }
                        }
                    }
                    
                }
                else  {
                    inputParam = this.setParam();
                    setting = {
                        type : _ajaxSelf.type || "POST",
                        url : _ajaxSelf.url,
                        async : _ajaxSelf.async,
                        cache : _ajaxSelf.cache,
                        data : inputParam,
                        dataType: _ajaxSelf.dataType,
                        beforeSend: function(xhr) {
                            //xhr.setRequestHeader("Cache-Control", "max-age=0")
                            if (typeof this.beforeSendFn === "function") {
                                _ajaxSelf.beforeSendFn(xhr);
                            }
                        }
                    }

                }


                let fnSuccess = function(data, textStatus, jqXHR) {

					//(view/action)메타요청
					//버전요청
                    /*
					if (_ajaxSelf.svcType.indexOf("service") > -1) {
						//var code = kosha.util.getObjectData(data, "common.result.code");
						//var msg  = kosha.util.getObjectData(data, "common.result.msg");

                        let code = data?.common?.result?.code;
                        let msg  = data?.common?.result?.msg;

						if (code !== "200") {
							console.log(_ajaxSelf.svcId + " , error : " + msg);
						}
					}
					*/
					if (typeof _ajaxSelf.successCallbackFn === 'function') {
						_ajaxSelf.successCallbackFn(data, textStatus, jqXHR);
					}
				},

				fnError = function(jqXHR, textStatus, errorThrown) {
					//console.error("jqXHR : ", jqXHR);
					//console.error("textStatus : " + textStatus);
					//console.error("errorThrown : " + errorThrown);
					if (typeof _ajaxSelf.errorCallbackFn === 'function') {
						_ajaxSelf.errorCallbackFn(jqXHR, textStatus, errorThrown);
					}
				},

				fnComplete = function(jqXHR, textStatus) {
					if (typeof _ajaxSelf.completeCallbackFn === 'function') {
						_ajaxSelf.completeCallbackFn(jqXHR, textStatus);
					}
				};

                jQuery.ajax(setting)
                .done(function(response, status, xhr) {
                    // 요청이 성공했을 때 실행되는 콜백
                    console.log('Request succeeded:');

					fnSuccess(response, status, xhr);
                })
                .fail(function(xhr, status, error) {
                    // 요청이 실패했을 때 실행되는 콜백
                    console.error('Request failed:', error);

                    fnError(xhr, status, error);
                })
                .always(function(xhr, status) {
                    // 요청이 완료된 후 항상 실행되는 콜백
                    console.log('Request completed(always)');
                    fnComplete(xhr, status);
                });

                /*
				jQuery.ajax({
					type : _ajaxSelf.type || "POST",
					url : _ajaxSelf.url,
					async : _ajaxSelf.async,
					cache : _ajaxSelf.cache,
					data : encParam,
					dataType: _ajaxSelf.dataType,
					beforeSend: function(xhr) {
						//xhr.setRequestHeader("Cache-Control", "max-age=0")
					},
					//contentType: "application/json",
					//headers: _this.header,
					//timeout: _this.timeout,
					success: function(data, textStatus, jqXHR) {
						fnSuccess(data, textStatus, jqXHR);
					},
					error: function(jqXHR, textStatus, errorThrown) {
						fnError(jqXHR, textStatus, errorThrown);
					},
					complete: function(jqXHR, textStatus) {
						fnComplete(jqXHR, textStatus);
					}
				});*/
			};
        }
    },


    TboardConfig = class {
        static instance = {};
        constructor(_type) {
            if (!_type) {
                throw new Exception("error : create TboardConfig Instance");
            }

            //값이 있으면 있는값 리턴
            if (TboardConfig.instance[ _type ]) {
                return TboardConfig.instance[ _type ];
            }
            //값이 없으면 없으면 객체 입력
            TboardConfig.instance[ _type ] = this;

            this.type   = _type;
            this.config = this.getConfig();
        }

        getConfig() {
            let tboardConfig = {
                default : {
                    resource : {
                        html: {
                            search : "/html/tboardList.html"
                            , detail : "/html/tboardDetail.html"
                            , write : "/html/tboard-write.html"
                        }
                    }
                }
            };
            return tboardConfig[ this.type ];
        }


    },

    //싱글톤으로 한번만
    //기본화면객체 -> 게시판오픈 시 객체 복사하여 생성 -> 게시판요청한 div에 붙이기
    TboardElementPrototype = class {
        static instance = {};
        constructor(_type) {
            if (!_type) {
                throw new Exception("error : create TboardElementPrototype Instance");
            }

            //값이 있으면 있는값 리턴
            if (TboardElementPrototype.instance[ _type ]) {
                return TboardElementPrototype.instance[ _type ];
            }
            //값이 없으면 없으면 객체 입력
            TboardElementPrototype.instance[ _type ] = this;

            this.type = _type;

            //기본객체 -> 객체를 타입 별 복사해서 동적으로 화면에 추가한다.
            this.elements = {
                root: {}
                , html : { //로드 한 html 객체
                }
                , view: { //실제 화면에 렌더링되는 객체
                    searchType1: undefined
                    , searchType2: undefined
                    , detailType1: undefined
                    , detailType2: undefined
                    , write:  undefined
                }
                /*defaultType1: undefined
                ,defaultType2: undefined
                ,inputType1: undefined
                ,radioType1: undefined
                ,checkType1: undefined
                ,dateType1: undefined
                ,datePeriodType1: undefined*/
            };

            this.tagMap = this.getTagMap();
            //this.init();
        }

        init() {
            //통합게시판 용 객체 선택자
            //this.tagId = this.getTboadSelectorId(this.info.type || "default");

            //html 중 root 객체 생성
            this.setRootElement();

            //html 중 depth1 객체 생성(조회화면, 상세화면, 등록/수정화면)
            this.setViewElement();



            //조회조건 항목 추출
            this.extractSearchElement();


            //초기화
            //this.initViewElement();


            //객체 추출
           // this.extractSearchElement();


           this.extractWriteElement();
        }
            
        extractWriteElement() {
            console.log("--------------------------------------------------extractWriteElement");
            console.log(this.elements.view.write);

            let dataTboardId    = this.tagMap.tboardId;

            //data-tboard-fld-type 별 el 복사
            this.elements.writeType1 = this.elements.writeType1 || {};


            let fldNodes = this.elements.view.write.querySelectorAll("[data-tboard-fld-type]");
            for (let fldNode of fldNodes) {
                // 각 fldNode에 대해 원하는 작업을 수행
                console.log(fldNode);
                console.log(fldNode.dataset.tboardFldType);
                let type = fldNode.dataset.tboardFldType;

                let grpKey = type.split(".")[0];
                let fldKey = type.split(".")[1];
                this.elements.writeType1[grpKey] = this.elements.writeType1[grpKey] || {};
                this.elements.writeType1[grpKey][fldKey] = fldNode.cloneNode(true);

                if (fldKey === "row") {
                    while(this.elements.writeType1[grpKey][fldKey].firstChild) {
                        this.elements.writeType1[grpKey][fldKey].firstChild.remove();
                    }
                }
            }

            
            //data-tboard-fld-grp 하위 삭제
            let fldGrp = this.elements.view.write.querySelectorAll("[data-tboard-fld-grp]");
            for (let grp of fldGrp) {
                while(grp.firstChild) {
                    grp.firstChild.remove();
                }

                let grpKey = grp.dataset.tboardFldGrp;
                this.elements.writeType1[grpKey] = this.elements.writeType1[grpKey] || {};
                this.elements.writeType1[grpKey].root = grp.cloneNode(true);
            }

            console.log(this.elements.writeType1);
            




            //write화면 생성

            console.log("--------------------------------------------------");
        }


        initViewElement() {
            Object.keys(this.elements.view).forEach(_key => {
                let viewNode = this.elements.view[_key];
                if (!viewNode) {
                    return;
                }
                
                let searchArea = viewNode.querySelector(`[data-tboard-id="searchDefaultArea"]`);
                while (searchArea.firstChild) {
                    searchArea.removeChild(searchArea.firstChild);
                }

            });
        }


        //root 화면
        setRootElement() { //각 화면 별 root
            let dataTboardId = this.tagMap.tboardId;
            let tagId = this.tagMap.root;

            Object.keys(this.elements.html).forEach(_key => {
                this.elements.root[ _key ] = this.elements.html[ _key ].querySelector(`[${dataTboardId}='${tagId}']`).cloneNode(true);
            });
        }

        setViewElement() {
            //let dataTboardId = this.tagMap.tboardType;
            let dataTboardViewType = this.tagMap.tboardViewType; //root 하위의 1뎁스 (화면 타입 구분)

            Object.keys(this.elements.view).forEach(_key => {
                let viewType = _key.split("Type")[0];
                let selector = `[${dataTboardViewType}*='${viewType}']`;

                //root 값이 없으면 다음
                if (!this.elements.root[ viewType ]) {
                    return;
                }

                let cloneRoot = this.elements.root[ viewType ].cloneNode(true);
                let nodes = cloneRoot.querySelectorAll(selector);
                Array.from(nodes).forEach(_node => {
                    if ([_key, viewType].includes( _node.dataset.tboardViewType ) === false) {
                        _node.remove();
                    }
                });

                this.elements.view[ _key ] = cloneRoot;
                //JSON.parse(this.elements.root[_key].querySelectorAll(selector)[0].dataset.tboardViewType)
//                this.elements.view[]
//                this.elements.view[_key];
            });
        }

        //조회화면 - 각 컴포넌트 로우
        extractSearchElement() {
            let dataTboardSearchType = this.tagMap.tboardSearchType; //조회조건 타입
            let selector = `[${dataTboardSearchType}]`;

            Object.keys(this.elements.view).forEach(_key => {
                if (!this.elements.view[_key]) {
                    return;
                }

                let viewNode = this.elements.view[_key];
                let fldNodes = viewNode.querySelectorAll(selector);

                Array.from(fldNodes).forEach(_fldNode => {
                    let fldKey = _fldNode.dataset.tboardSearchType;
                    this.elements[ _key ] = this.elements[ _key ] || {};
                    this.elements[ _key ][ fldKey ] = _fldNode.cloneNode(true);

                    this.removeSelectOptions(this.elements[ _key ][ fldKey ]);
                    this.checkCheckboxes(this.elements[ _key ][ fldKey ]);
                    this.removeRadioButtons(this.elements[ _key ][ fldKey ]);


                    if (_key === "searchType1") {
                        if (fldKey === "defaultType1") {
                            console.log("defaultType1");


                        }
    
                        if (fldKey === "selectType1") {
                            console.log("selectType1");
                        }
                        
                        if (fldKey === "radioType1") {
                            console.log("radioType1");
    
                        }
    
                        if (fldKey === "checkType1") {
                            console.log("checkType1");
                        }
                        
                        if (fldKey === "inputType1") {
                            console.log("inputType1");
                        }
    
                        if (fldKey === "dateType1") {
                            console.log("dateType1");
                        }
    
    
                        if (fldKey === "dateperiodType1") {
                            console.log("dateperiodType1");
                        }
                    }


                });
                //this.elements[_key]
            });
        }


        removeSelectOptions(_node) {
            // 모든 select 요소를 찾아서 처리
            const selectElements = _node.querySelectorAll('select');
            selectElements.forEach(select => {
                // 모든 option 요소를 찾아서 제거
                const options = select.querySelectorAll('option');
                options.forEach(option => option.remove());
            });
        }

        // checkbox를 체크하는 함수
        checkCheckboxes(_node) {
            // 모든 checkbox input 요소를 찾아서 체크
            const checkboxes = _node.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.remove();// 체크박스 체크
            });
        }

        // radio 요소를 제거하는 함수
        removeRadioButtons(_node) {
            // 모든 radio input 요소를 찾아서 제거
            const radioButtons = _node.querySelectorAll('input[type="radio"]');
            radioButtons.forEach(radio => {
                radio.remove(); // 라디오 버튼 제거
            });
        }



        //조회, 등록, 상세 화면
        getViewElement() {
            let dataTboardId    = this.tagMap.tboardId;
            this.tagMap.view.forEach(_key => {
                let tagId = this.tagMap.view[_key];
                this.elements.view[_key] = this.elements.root.querySelector(`[${dataTboardId}='${tagId}']`).cloneNode(true);
            });
        }

        //조회화면 - 각 컴포넌트 로우
        /*extractSearchElement() {
            let dataTboardId    = this.tagMap.tboardId;
            this.tagMap.search.forEach(_key => {
                let tagId = this.tagMap.search[_key];
                this.elements.search[_key] = this.elements.root.querySelector(`[${dataTboardId}='${tagId}']`).cloneNode(true);
            });
        }*/

        //상세화면 - 각 컴포넌트 로우
        extractDetailElement() {
            let dataTboardId    = this.tagMap.tboardId;
            this.tagMap.detail.forEach(_key => {
                let tagId = this.tagMap.detail[_key];
                this.elements.detail[_key] = this.elements.root.querySelector(`[${dataTboardId}='${tagId}']`).cloneNode(true);
            });
        }

        //등록화면 - 각 컴포넌트 로우
        //extractWriteElement() {
            // let dataTboardId    = this.tagMap.tboardId;
            // this.tagMap.write.forEach(_key => {
            //     let tagId = this.tagMap.write[_key];
            //     this.elements.write[_key] = this.elements.root.querySelector(`[${dataTboardId}='${tagId}']`).cloneNode(true);
            // });
        //}


        getTagMap() {
            let tboardIdInfo = {
                default : {
                    root: "tboard-root" //root
                    , tboardId : "data-tboard-id" //개별컴포넌트를 구분하는 ID
                    , tboardName : "data-tboard-name" //개별컴포넌트를 구분하는 이름
                    , tboardType  : "data-tboard-type" //개별컴포넌트를 구분하는 타입
                    , tboardViewType : "data-tboard-view-type" //화면구분
                    , tboardSearchType : "data-tboard-search-type" //조회조건타입
                    , view : {
                        searchType1: ""
                        , searchType2: "" //gallery
                        , detailType1: ""
                        , detailType2: ""
                        , write: ""
                    }
                    , search: { //조회
                        row: "tboardSearchRow"
                        , defaultType1: "defaultType1"
                        , defaultType2: "defaultType2"
                        , inputType1: "inputType1"
                        , radioType1: "radioType1"
                        , checkType1: "checkType1"
                        , dateType1: "dateType1"
                        , datePeriodType1: "datePeriodType1"
                    }
                    , detail: { //상세

                    }
                    , write: { //등록수정

                    }

                }
            };
            return tboardIdInfo[ this.type ];
        }
    }




class TboardUtil {
    constructor() {

    }
}




//조회조건 1-1 ~ 1-8 객체 생성(타입별로 객체를 생성)
class TboardElement {
    constructor(_info) {

        this.info = Object.assign(_info || {}, {type: "default"});

        this.serachRoot  = "search-root";
        this.serachRow   = "search-row";
        this.serachLeft  = "search-left";
        this.serachRight = "search-right";

        this.tagId = {
            root: undefined
            , tboardId : undefined
            , tboardName : undefined
            , tboardType  : undefined
            , view: {
                search: undefined
                , detail: undefined
                , write:  undefined
            },
        };
        //기본객체 -> 이객체를 타입 별 복사해서 동적으로 화면에 추가한다.
        this.elements = {
            root: undefined
            , view: {
                search: undefined
                , detail: undefined
                , write:  undefined
            },

            defaultType1: undefined
            ,defaultType2: undefined
            ,inputType1: undefined
            ,radioType1: undefined
            ,checkType1: undefined
            ,dateType1: undefined
            ,datePeriodType1: undefined
        };


        this.init();
    }

    init() {

        //통합게시판 용 객체 선택자
        //this.tagId = this.getTboadSelectorId(this.info.type || "default");

        //html 중 root 객체 생성
        this.createRootInstance();

        //html 중 depth1 객체 생성(조회화면, 상세화면, 등록/수정화면)
        this.createViewInstance();


        //객체 추출
        this.extractSearchElement();
    }

    generateUniqueId() {
        return Date.now() + '-' + Math.floor(Math.random() * 10000);
    }

    //root 객체(화면객체 상위)
    createRootInstance() {
        log.log("pos2");
        this.elements.root = this.getElementById(this.tagId.root);

        this.tagId.root = this.tagId.root + "-" + this.generateUniqueId();
        this.elements.root.id = this.tagId.root;
    }

    //화면 객체(조회화면, 상세화면, 작성화면)
    createViewInstance() {
        /*
            조회화면
            - 기본조회조건
            - 상세조회조건
            - 결과목록
            - 페이징
            - 정렬순서
            - 기타
            상세화면
            - 타이틀
            - 기본항목
            - 메인컨텐츠
            - 버튼영역
            - 이전다음
            - 댓글
            - 대댓글
            - 첨부파일
            등록화면
            - 입력항목영역
            - 에디터영역
            - 버튼영역
        */

        //조회화면, 상세화면, 등록화면 html to object
        Object.keys(this.tagId.view).forEach(_key => {
            let tboardId = this.tagId.view[_key];
            this.elements.view[_key] = this.getElementById(tboardId);
        });


        //html에서 root 기준으로 1-1 ~ 1-8 추출
        const searchEls = document.querySelectorAll(`.${this.serachRow}`);
        searchEls.forEach((el) => {

            //id 기준으로 각 element객체 분리 하여 변수에 저장
            //el.dataset.tboardId;

            this.elements[ el.dataset.tboardId ] = el.cloneNode(true);
        });
    }


    util() {


    }

    getElementById(_tboardId) {
        return document.querySelector(`[${this.tagId.tboardId}="${_tboardId}"]`);
    }

    getElementsById(_tboardId) {
        return document.querySelectorAll(`[${this.tagId.tboardId}="${_tboardId}"]`);
    }

    //
    extractSearchElement() {
        //html에서 root 기준으로 1-1 ~ 1-8 추출
        const searchEls = document.querySelectorAll(`.${this.serachRow}`);
        searchEls.forEach((el) => {

            //id 기준으로 각 element객체 분리 하여 변수에 저장
            //el.dataset.tboardId;

            this.elements[ el.dataset.tboardId ] = el.cloneNode(true);
        });
        console.log(this.elements);
    }

    //타입 별 search 조건 객체 생성
    createSearchElement(_type) {
        if (_type) {
            throw new Error("_type erorr");
        }
        return this.elements[ el.dataset.tboardId ].cloneNode(true);
    }

    create(_type) {
        return this.elements[ _type ].cloneNode(true);
    }
}



//개별 조회조건 객체
class SearchCondition {
    constructor({...args}) {
        if (!args || !args.data) {
            throw new Error("_type erorr");
        }
        this.element = args.element;
        this.data    = args.data;
        this.info    = args.info;
    }


    getData() {

    }

    setData() {

    }

    getValueInputType1() {

    }
}

var log = new class Log {
    constructor() {
        this.posInfo = [];
    }
    reg = (pos) => {
        this.posInfo.push(pos);
    }
    reset  = () => {
        this.posInfo = [];
    }
    log  = (pos) => {
        if (this.posInfo.includes(pos)) {
            debugger;
        }
    }
}
log.reg("pos2");



// const commandMap = {
//     'start': startGame,
//     'pause': pauseGame,
//     'restart': restartGame
// };

// const handlers = {
//     onSubmit: handleSubmit,
//     onChange: handleChange,
//     onClick: handleClick
// };


(function init() {

    window["koshaTboard"] = new KOSHATboard();

    window["Tboard"] = Tboard;
    

}());


}());


// const obj = {
//     "1": "C01",
//     "2": "C02",
//     "4": "C04",
//     "3": "C03"
//   };
  
//   // root div 가져오기
//   const root = document.getElementById("root");
  
//   // 객체의 키 순서대로 정렬
//   const keys = Object.keys(obj).sort((a, b) => a - b);
  
//   // 키 순서대로 div 생성 후 root div에 추가
//   keys.forEach(key => {
//     const div = document.createElement("div");
//     div.setAttribute("data-tboard-artcl-id", obj[key]);
//     root.appendChild(div);
//   });





// // 주어진 객체
// var obj = {
//     "C01": { "req": "", "prm": "N", "enc": "", "len": "50" , "type": "input"},
//     "C02": { "req": "Y", "prm": "N", "enc": "", "len": "20" , "type": "date"},
//     "C03": { "req": "Y", "prm": "N", "enc": "", "len": "30", "type": "select" },
//     "C04": { "req": "N", "prm": "N", "enc": "", "len": "50", "type": "check"}
// };

// // root div 가져오기
// const root = document.getElementById("root");

// // 예시 객체 키
// const keys = ["C01", "C02", "C03", "C04"];

// // 각 div에 대해 객체 값을 비교하고 로직 처리
// keys.forEach(key => {
//     const div = document.createElement("div");
//     div.setAttribute("data-tboard-artcl-id", key);

//     // 각 객체의 항목을 가져옴
//     const item = obj[key];

//     // 'req' 값에 따라 조건 처리
//     if (item.req === "Y") {
//         console.log(`${key}: req is required.`);
//         // 추가 로직
//     } else if (item.req === "") {
//         console.log(`${key}: req is not required.`);
//         // 추가 로직
//     }

//     // 'prm' 값에 따라 조건 처리
//     if (item.prm === "Y") {
//         console.log(`${key}: prm is yes.`);
//         // 추가 로직
//     } else {
//         console.log(`${key}: prm is no.`);
//         // 추가 로직
//     }

//     // 'enc' 값에 따라 조건 처리
//     if (item.enc === "") {
//         console.log(`${key}: enc is empty.`);
//         // 추가 로직
//     } else {
//         console.log(`${key}: enc is not empty.`);
//         // 추가 로직
//     }

//     // 'len' 값에 따라 조건 처리
//     if (parseInt(item.len) > 40) {
//         console.log(`${key}: len is greater than 40.`);
//         // 추가 로직
//     } else {
//         console.log(`${key}: len is 40 or less.`);
//         // 추가 로직
//     }

//     // div를 root에 추가
//     root.appendChild(div);
// });

// // 주어진 객체
// var obj = {
//     "C01": { "req": "", "prm": "N", "enc": "", "len": "50", "type": "input" },
//     "C02": { "req": "Y", "prm": "N", "enc": "", "len": "20", "type": "date" },
//     "C03": { "req": "Y", "prm": "N", "enc": "", "len": "30", "type": "select" },
//     "C04": { "req": "N", "prm": "N", "enc": "", "len": "50", "type": "check" }
// };

// // root div 가져오기
// const root = document.getElementById("root");

// // 객체 키를 순차적으로 처리
// Object.keys(obj).forEach(key => {
//     const item = obj[key];

//     // div 요소 생성 (각 항목을 포함할 div)
//     const div = document.createElement("div");
//     div.setAttribute("data-tboard-artcl-id", key);

//     // 타입에 맞는 HTML 요소 생성
//     let element;

//     switch(item.type) {
//         case "input":
//             element = document.createElement("input");
//             element.setAttribute("type", "text");  // 기본적으로 text 입력으로 설정
//             element.setAttribute("maxlength", item.len);  // 길이 제한
//             break;
//         case "date":
//             element = document.createElement("input");
//             element.setAttribute("type", "date");
//             break;
//         case "select":
//             element = document.createElement("select");
//             const option1 = document.createElement("option");
//             option1.value = "option1";
//             option1.textContent = "Option 1";
//             const option2 = document.createElement("option");
//             option2.value = "option2";
//             option2.textContent = "Option 2";
//             element.appendChild(option1);
//             element.appendChild(option2);
//             break;
//         case "check":
//             element = document.createElement("input");
//             element.setAttribute("type", "checkbox");
//             break;
//     }

//     // "req"에 따른 처리 (필수 여부)
//     if (item.req === "Y") {
//         element.setAttribute("required", true);
//     }

//     // 추가적인 로직
//     if (item.prm === "Y") {
//         console.log(`${key}: prm is yes.`);
//     }

//     if (item.enc === "") {
//         console.log(`${key}: enc is empty.`);
//     }

//     // div에 element를 추가하고 root에 append
//     div.appendChild(element);
//     root.appendChild(div);
// });




// // 각 타입에 맞는 클래스를 정의
// class BaseField {
//     constructor(id, type, len) {
//         this.id = id;  // 해당 객체의 id (C01, C02, C03, C04)
//         this.type = type;  // 해당 객체의 타입
//         this.len = len;  // 길이 제한
//         this.element = this.createElement();  // HTML 요소 생성
//     }

//     createElement() {
//         let element;
//         switch(this.type) {
//             case "input":
//                 element = document.createElement("input");
//                 element.setAttribute("type", "text");
//                 element.setAttribute("maxlength", this.len);
//                 break;
//             case "date":
//                 element = document.createElement("input");
//                 element.setAttribute("type", "date");
//                 break;
//             case "select":
//                 element = document.createElement("select");
//                 const option1 = document.createElement("option");
//                 option1.value = "option1";
//                 option1.textContent = "Option 1";
//                 const option2 = document.createElement("option");
//                 option2.value = "option2";
//                 option2.textContent = "Option 2";
//                 element.appendChild(option1);
//                 element.appendChild(option2);
//                 break;
//             case "check":
//                 element = document.createElement("input");
//                 element.setAttribute("type", "checkbox");
//                 break;
//             default:
//                 console.error("Unknown type:", this.type);
//                 break;
//         }
//         return element;
//     }

//     getData() {
//         switch(this.type) {
//             case "input":
//                 return this.element.value;
//             case "date":
//                 return this.element.value;
//             case "select":
//                 return this.element.value;
//             case "check":
//                 return this.element.checked;
//             default:
//                 return null;
//         }
//     }

//     render() {
//         const div = document.createElement("div");
//         div.setAttribute("data-tboard-artcl-id", this.id);
//         div.appendChild(this.element);
//         return div;
//     }
// }



// // getData를 사용해 각 타입에 맞는 데이터 가져오기
// const getAllData = () => {
//     return fields.map(field => ({
//         id: field.id,
//         value: field.getData()
//     }));
// };


let bbsComCode = new class {
    constructor() {
        this.comCode = {
            "ast" : {
                "C0002": {
                    "CD000201": "CD000201_NM"
                    , "CD000202": "CD000202_NM"
                    , "CD000203": "CD000203_NM"
                    , "CD000204": "CD000204_NM"
                    , "CD000205": "CD000205_NM"
                    , "CD000206": "CD000206_NM"
                    , "CD000207": "CD000207_NM"
                    , "CD000208": "CD000208_NM"
                    , "CD000209": "CD000209_NM"
                    , "CD000210": "CD000210_NM"
                    , "CD000211": "CD000211_NM"
                    , "CD000212": "CD000212_NM"
                },
                "C0003": {
                    "CD000301": "CD000301_NM"
                    , "CD000302": "CD000302_NM"
                    , "CD000303": "CD000303_NM"
                    , "CD000304": "CD000304_NM"
                    , "CD000305": "CD000305_NM"
                    , "CD000306": "CD000306_NM"
                    , "CD000307": "CD000307_NM"
                    , "CD000308": "CD000308_NM"
                    , "CD000309": "CD000309_NM"
                    , "CD000310": "CD000310_NM"
                    , "CD000311": "CD000311_NM"
                    , "CD000312": "CD000312_NM"
                }

            },
            "acm" : {
                "C0001": {
                    "CD00101": "CD00101_NM"
                    , "CD00102": "CD00102_NM"
                    , "CD00103": "CD00103_NM"
                    , "CD00104": "CD00104_NM"
                    , "CD00105": "CD00105_NM"
                    , "CD00106": "CD00106_NM"
                    , "CD00107": "CD00107_NM"
                    , "CD00108": "CD00108_NM"
                    , "CD00109": "CD00109_NM"
                    , "CD00110": "CD00110_NM"
                    , "CD00111": "CD00111_NM"
                    , "CD00112": "CD00112_NM"
                }
            }
        }
    }

    getCodeList(type, code) {
        return this.comCode[type][code];
    }
    
}
