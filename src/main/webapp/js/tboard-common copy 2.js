(function(){

    //싱글톤
    class KoshaTboard {
        static instance;    
        constructor() {
            debugger;

            //값이 있으면 있는값 리턴
            if (KoshaTboard.instance) {
                return KoshaTboard.instance;
            }
            //값이 없으면 없으면 객체 입력
            KoshaTboard.instance = this;    

            //this.bbsId = _args.bbsId;
            this.props = undefined;
            this.elememnt = undefined;

            //
            this.bbsInfo = {};
            //this.bbsId = _args.bbsId;
            this.#setProperties();

            this.#setTBoardElemProto();

        }

        //private
        #loadScript() {
            //에디터, 피커 등
        }
        //private
        #loadStyle() {
            //css
        }
        //private
        #setProperties() {
            this.#loadScript();
            this.#loadStyle();
            this.props = new TboardProperties();
        }

        #setTBoardElemProto() {
            this.elememnt = new TboardElementPrototype();
        }

        init(_args) {
            const tboard = new Tboard(boardDatas);
            //객체 생성        
            //let uniqBbsId = this.generateUniqueId();
            //this.bbsInfo[uniqBbsId] = new Tboard(boardDatas, uniqBbsId);
        }

        generateUniqueId() {
            return Date.now() + '-' + Math.floor(Math.random() * 10000);
        }
    }




// 조회조건을 관리하는 객체 배열
class Tboard {
    constructor(_tboardInfo) {
debugger;

        this.TBoardElemProto;
        this.TBoardElem;

        this.auth = {};
        this.tagIdMap = {};
        //
        console.log("_tboardInfo : ", _tboardInfo);

        this.searchDefaultArea = null;

        this.viewInfo = {
            search: {} //조회화면
            , detail: {} //상세화면
            , regist: {} //등록화면
        };

        //this.tboardSearchElement = new TboardSearchElement();
        
        
        this.TBoardElem = new TboardElement();

        this.searchConditions = {};
        this.searchConditionsMap = {};
        this.fieldInfos;

        this.init();
    }

    init() {
        log.log("pos3"); 
        

        //기본권한체크
        this.renderBbsView();
    
        //객체생성
        //this.createSearchCondition(datas);
        //화면추가
        //this.renderSearchCondition();
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

        let extractSearchView = () => {

        };

        let extractDetailView = () => {

        };
        
        let extractRegistView = () => {

        };
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
        debugger;
        this.searchDefaultArea = this.getSearchDefaultArea()
        this.searchDefaultArea.appendChild(this.searchConditions[ this.searchConditionsMap[0] ].element );
    }

    getSearchDefaultArea(searchRow) {
        const searchDefaultArea = "searchDefaultArea";
        const searchArea = document.querySelector(`[data-tboard-id="${searchDefaultArea}"]`);
        return searchArea;
    }
}



class TboardProperties {
    static instance;    
    constructor() {
        //값이 있으면 있는값 리턴
        if (TboardProperties.instance) {
            return TboardProperties.instance;
        }
        //값이 없으면 없으면 객체 입력
        TboardProperties.instance = this;    
debugger;

        this.init();
    }

    //TboardProperties 정의
    init() {
        this.site = "portal";
        this.tagIdType = "default";

        this.tagId = this.getTboadSelectorId();
    }

    
    getTboadSelectorId() {
        let tboardIdInfo = {
            default : {
                root: "tboard-root" //root
                , tboardId : "data-tboard-id" //개별컴포넌트를 구분하는 ID
                , tboardName : "data-tboard-name" //개별컴포넌트를 구분하는 이름
                , tboardType  : "data-tboard-type" //개별컴포넌트를 구분하는 타입
                , view : {
                    search: ""
                    , detail: ""
                    , regist: ""
                }
                , search: { //조회                   

                }
                , detail: { //상세

                }
                , regist: { //등록수정

                }
                
            }
        };

        return tboardIdInfo[ this.tagIdType ];
    }

    /*
    properties() {
        let properties = {
            site: "portal"
            , tagType: "default"
        };

        let _get = (_key) => {
            if (!properties.hasOwnProperty(_key)) {
                return null;
            }
            return properties.hasOwnProperty(_key);
        }

        let _set = (_key) => {
            properties[_key] = _value;
        }

        return {
            get : _get,
            get : _set,
        }
    }

    get(_key) {
        return this.properties().get(_key);
    }

    set(_key, _value) {
        this.properties().set(_key, _value);
    }*/
}



    //싱글톤으로 한번만
    //기본화면객체 -> 게시판오픈 시 객체 복사하여 생성 -> 게시판요청한 div에 붙이기
    class TboardElementPrototype {
        static instance;    
        constructor() {
            //값이 있으면 있는값 리턴
            if (TboardElementPrototype.instance) {
                return TboardElementPrototype.instance;
            }
            //값이 없으면 없으면 객체 입력
            TboardElementPrototype.instance = this;    

            this.init();
        }

        init() {
            let dataTboardId = KoshaTboard.props.tagId.tboardId;
            let tboardRoot = KoshaTboard.props.tagId.root;

            this.element = document.querySelector(`${dataTboardId}='${tboardRoot}']`).cloneNode(true);
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
  debugger;

(function init(){
    window["KoshaTboard"] = new KoshaTboard();
}());


}());


