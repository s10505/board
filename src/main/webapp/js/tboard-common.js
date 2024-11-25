(function(){


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


            //기본권한체크
            this.renderBbsView();

            //객체생성
            //this.createSearchCondition(datas);
            //화면추가
            //this.renderSearchCondition();

            //권한체크
            await this.checkPermission();





            this.tboardViewManager = new TboardViewManager(this.fullOptions, this.userOptions);
            //debugger;
            this.tboardViewEvent = new TboardViewEvent(this.viewType, this.tboardViewManager.bbsView);
            
            
            debugger;




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
            _args = _args || {};
            let type = _args.type || "default";

            debugger;

            const tboard = new Tboard(_args);
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

			execute() {

                let _ajaxSelf = this;
				let encParam = this.setParam();


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

                jQuery.ajax({
					type : _ajaxSelf.type || "POST",
					url : _ajaxSelf.url,
					async : _ajaxSelf.async,
					cache : _ajaxSelf.cache,
					data : encParam,
					dataType: _ajaxSelf.dataType,
					beforeSend: function(xhr) {
						//xhr.setRequestHeader("Cache-Control", "max-age=0")
                        if (typeof this.beforeSendFn === "function") {
                            _ajaxSelf.beforeSendFn(xhr);
                        }
					}
                })
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
                            , write : ""
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
            this.initViewElement();


debugger;
            //객체 추출
           // this.extractSearchElement();
        }

        initViewElement() {
            debugger;
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
            debugger;
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
        extractWriteElement() {
            let dataTboardId    = this.tagMap.tboardId;
            this.tagMap.write.forEach(_key => {
                let tagId = this.tagMap.write[_key];
                this.elements.write[_key] = this.elements.root.querySelector(`[${dataTboardId}='${tagId}']`).cloneNode(true);
            });
        }


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

        debugger;
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

}());


}());





