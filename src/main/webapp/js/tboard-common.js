
// 조회조건을 관리하는 객체 배열
const datas = [
    { type: 'selectType1', name: '카테고리', options: ['전체', '공지사항', '게시물', '뉴스'] },
    { type: 'radioType1', name: '상태', options: ['활성', '비활성'] },
    { type: 'checkType1', name: '추가옵션', options: ['옵션1', '옵션2', '옵션3'] },
    { type: 'dateType1', name: '시작일' },
    { type: 'datePeriodType1', name: '종료일' },
    { type: 'inputType1', name: '검색어' }
];




// 페이지 로드 시 조회조건 요소 생성
document.addEventListener('DOMContentLoaded', () => {    
    //객체 추출
    debugger;
    const tboard = new Tboard();

    
    //화면에서 사용할 객체로 변환
    //const srchCondition = new SearchCondition(srchFieldInfo, datas);
});



class Tboard {
    constructor(_fieldInfo) {
        this.searchDefaultArea = null;

        this.tboardSearchElement = new TboardSearchElement();
        //this.tboardDetailElement = new TboardSearchElement();
        //this.tboardRegistElement = new TboardSearchElement();

        this.searchConditions = {};
        this.searchConditionsMap = {};
        this.fieldInfos;


        //객체생성
        this.createSearchCondition(datas);
        //화면추가
        this.renderSearchCondition();

    }


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


//조회조건 1-1 ~ 1-8 객체 생성(타입별로 객체를 생성)
class TboardSearchElement {

    constructor() {        
        this.rootEl      = null;        
        this.tboardId    = "data-tboard-id";        
        this.serachRoot  = "search-root";
        this.serachRow   = "search-row";
        this.serachLeft  = "search-left";
        this.serachRight = "search-right";

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

        //객체 추출
        this.extractSearchElement();
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