// 페이지 로드 시 조회조건 요소 생성
document.addEventListener('DOMContentLoaded', () => {
    createFilterElements(filterConditions);

});


//조회조건 1-1 ~ 1-8 객체 생성(타입별로 객체를 생성)
class TboardSearchElement{
    constructor(_type) {
        if (_type) {
            throw new Error("_type erorr");
        }

        this.type     = _type;
        this.rootEl   = null;
        this.element  = this[`create${type}`];
        
        this.tboardId = "tboard-data-id";
        
        this.serachRoot = "search-root";
        this.serachRow = "search-row";
        this.serachLeft = "search-left";
        this.serachRight = "search-right";

        this.extractSearchElement();

        //기본객체 -> 이객체를 타입 별 복사해서 동적으로 화면에 추가한다.
        this.elements = {
            defaultType1: undefined
            ,defaultType2: undefined
            ,inputType1: undefined
            ,radioType1: undefined
            ,checkType1: undefined
            ,dateType1: undefined
            ,datePeriodType1: undefined
        };
    }

    //
    extractSearchElement() {       
        //html에서 root 기준으로 1-1 ~ 1-8 추출
        const searchEls = document.querySelectorAll(this.serachRoot); 
        searchEls.forEach((el) => {
            
            //id 기준으로 각 element객체 분리 하여 변수에 저장
            //el.dataset.tboardId;

            this.elements[ el.dataset.tboardId ] = el.cloneNode(true);
        });
    }

    createSearchElement(_type, _data) {
        return this.elements[ _type ].cloneNode(true);
    }

    addTboardId(_element, _value) {
        _element.setAttribute(this.tboardId, _value);
    }

    //
    changeClass() {

    }

    //
    동적생성() {
        return new searchElement();
    }

    //이게 아니네    
    createSearchRowElement() {
        //search root
        const rowDiv = document.createElement('div');
        rowDiv.className = 'search-row';
        searchRowDiv.setAttribute('tboard-data-id', '');

        //search row
        const searchRowDiv = document.createElement('div');
        searchRowDiv.className = "";
        searchRowDiv.setAttribute('tboard-data-id', 'search_row');


        //search title div
        const titleDiv = document.createElement('div');
        titleDiv.setAttribute('tboard-data-id', 'type_check_title');

        //title
        const titleSpan = document.createElement('span');
        titleSpan.textContent = "${this.title}";


        //search content div
        const contentDiv = document.createElement('div');
        contentDiv.setAttribute('tboard-data-id', 'type_check_self');
        
        //content
        //타입에 따라 생성 후 붙인다.
        this.element;

        searchRowDiv.appendChild(titleDiv);
        searchRowDiv.appendChild(contentDiv);
        rowDiv.appendChild(searchRowDiv);

        return rowDiv;
    }
}












// 조회조건을 관리하는 객체 배열
const filterConditions = [
    { type: 'select', label: '카테고리', options: ['전체', '공지사항', '게시물', '뉴스'] },
    { type: 'radio', label: '상태', options: ['활성', '비활성'] },
    { type: 'checkbox', label: '추가옵션', options: ['옵션1', '옵션2', '옵션3'] },
    { type: 'date', label: '시작일' },
    { type: 'date', label: '종료일' },
    { type: 'input', label: '검색어' }
];



const fieldInfoArrTemp = [
    {
        fieldKey: "" //항목번호
        , type  : { //추가적인 정보
            seCd: ""  //select, re
            , bind: ""
            , mask: ""
            //기본mask, 썸네일 정보, 공통코드 등 등
        }
        ,name: {
            default: "" //항목명
            ,kr: "" //한글명
            ,eng: "" //영문명
        }        
        , auth : { //권한

        }                        
        , inputTypeCd: "" //일반항목,권한항목
        , fieldPosCd: "" //필드위치(조회조건, 목록, 입력, 상세)
        , class: { //class 설정
            widthType: "" //메인100 한줄100, 메인100 한줄50, 한줄50
            , before: ""
            , after: ""
        }
    }
];


//키(항목번호)/밸류(명칭)
const fieldNameMap = {
    "1": "제목"
    ,"2": "내용"
    ,"3": "등록자"
    ,"4": "등록일"
    ,"5": "첨부파일"
    ,"6": "조회수"
    ,"7": "카테고리"    
    ,"8": "게시연월"
    ,"9": "승인상태"
};


//defaultType1로 들어갈수 있는것은 input 타입의 항목만

//defaultType2로 들어갈수 있는것은 input 타입의 항목 + select 하나


//타이틀/객체/서브객체
const fieldInfoTemp = {
    //객체 별 uniq값으로 생성하여 관리
    "obj": {
        "xasx": {}
        ,"xdasd": {}
    },
    //실제 화면에 보여질 값
    "info": {
        //순서대로 표시(key는 sort)
        "searchCnd": {
            "1": {
                type: "default"
                , fieldKey: [1,2,3]
                , sub: ""
                , title: "검색조건"
            }
            , "2": "1-1"
            , "3": "1-2"            
        },
        "dtlCnd": {

        },
        "dtlView": {

        },
        "registView": {

        },
        "editView": {

        }
    },

    //DB에서 가져온 값 세팅
    "dbInfo" : {
        "1" : {
            fieldKey: "1"
            , name: {
                default: "순번"
                ,kr: "순번"
                ,eng: "NO"
            }
            , searchCndInfo  : {
                seCd: ""
                , bind: ""
                , mask: ""
            }
            , dtlCndInfo  : {
                seCd: ""
                , bind: ""
                , mask: ""
            }
            , dtlViewInfo : {

            }
            , registViewInfo: {
    
            }
            , editViewInfo: {
    
            }
            , auth : { //권한
            
            }
            , inputTypeCd: "" //일반항목,권한항목
            , fieldPosCd: "01" //필드위치(조회조건, 목록, 입력, 상세)
            , class: { //class 설정
                widthType: "100" //메인100 한줄100, 메인100 한줄50, 한줄50
                , before: ""
                , after: ""
            }
        }
    }
};




/*
loop 
  -> type
  -> 객체생성
  //new TboardSearchElement();
*/  







class searchElement {
    constructor(_element) {
        this.element = _element;
        this.elementMap = {
            defaultType1: "",
            inputType1: "",
            selectType1: "",
            radioType1: "",
            checkType1: "",
            dateType1: "",
            datePeriodType1: "",
        };
        //DB에 입력된 값 and 객체 고유속성정의
        //객체고유아이디
        //
        //타이틀
        //타입
        
        /*DB*/
        //항목코드
        //입력유형
        //권한
        //표시여부
        //정렬순서
        //항목명
        //항목표시명
        //항목영문표시명       
    }

    element = class {
        constructor() {

        }


    }

    build() {
        return new this.element();
    }

    //객체를 생성 해서 반환
    createSearchElement = (_type) => {
        //
        return new this.elementMap[_type](_args);
    }

    setData() {

    }


    getValue() {

    }

    setValue() {

    }
}



//게시판에서 사용하는 조회조건 관리
class TboardSearchElement {
    constructor(_objDatas) {
        this.objDatas = _objDatas;
        this.bbsSrchEls = {};
    }


    //특정조건 값만 가져오기
    getValue() {

    }

    //특정조건 값만 세팅하기
    getValue() {

    }


    //조회조건 전체 값 가져오기
    getValues() {

    }

    //조회조건에 전체 값 바인딩
    setValues() {

    }

    //초기화
    initValues() {

    }
}

//조회조건 1-1 ~ 1-8 객체 생성(생성한 객체를 화면에서 사용할 수 있도록 가공, 실사용객체)
//생성된 각 객체는 fieldInfoTemp에 넣어서 관리
class TboardSearchElement{
    constructor(_element) {
        this.element = _element; //생성된 객체
        this.info = {}; //객체에 기본정보
    }
    setDataBind(_element, _data) {
        //
    }
}




class searchElement {
    constructor(_element) {
        this.element = _element;

        //DB에 입력된 값 and 객체 고유속성정의
        //객체고유아이디
        //
        //타이틀
        //타입
        
        /*DB*/
        //항목코드
        //입력유형
        //권한
        //표시여부
        //정렬순서
        //항목명
        //항목표시명
        //항목영문표시명       
    }

    setData() {

    }


    getValue() {

    }

    setValue() {

    }
}










class SearchField {
    constructor(title, content) {
        //DB에 입력된 값 and 객체 고유속성정의
        //객체고유아이디
        //
        //타이틀
        //타입
        
        /*DB*/
        //항목코드
        //입력유형
        //권한
        //표시여부
        //정렬순서
        //항목명
        //항목표시명
        //항목영문표시명


        this.title = title;
        this.content = content;

    }

    createElement() {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'search-row';

        const searchRowDiv = document.createElement('div');
        searchRowDiv.setAttribute('tboard-data-id', 'search_row');

        const titleDiv = document.createElement('div');
        titleDiv.setAttribute('tboard-data-id', 'type_check_title');
        titleDiv.innerHTML = `<span>${this.title}</span>`;

        const contentDiv = document.createElement('div');
        contentDiv.setAttribute('tboard-data-id', 'type_check_self');
        contentDiv.innerHTML = this.content;

        searchRowDiv.appendChild(titleDiv);
        searchRowDiv.appendChild(contentDiv);
        rowDiv.appendChild(searchRowDiv);

        return rowDiv;
    }
}


function addSearchRow(searchRow) {
    const searchArea = document.getElementById('search-form');
    const rowElement = searchRow.createElement();
    searchArea.appendChild(rowElement);
}





const searchCondition1 = new SearchRow('조회 조건', `
    <select id="search-type">
        <option value="all">전체</option>
        <option value="title">제목</option>
        <option value="content">내용</option>
    </select>
    <input type="text" id="search-keyword" placeholder="검색어 입력">
`);

const searchCondition2 = new SearchRow('카테고리', `
    <select id="category">
        <option value="all">모든 카테고리</option>
        <option value="news">뉴스</option>
        <option value="notice">공지사항</option>
        <option value="event">이벤트</option>
    </select>
`);

debugger;

addSearchRow(searchCondition1);
addSearchRow(searchCondition2);

