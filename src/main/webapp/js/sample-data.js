//백엔드에서 넘어온 데이터는 이렇게 예상
var boardDatas = {
    bbsInfo: {  //게시판기본
        name: "공지사항"
        , engName: "Notice"
        , type: "default" //defalut, gallery
        , bbsId: ""
        , bbsGrpId: ""
        , menuId: ""
        , detaliVeiwType: "defalut" //일반, 팝업
    }
    , sInfo: {
        token: "" //header
        , refreshToken: ""
        , type: "T" //T 토큰, S 세션
    }
    , authInfo : {  //권한
        //채널
        //기능
        //권한
        //대상자
    }
    , filedInfo : [ //항목
        {   type: 'selectType1'
            , name: '카테고리'
            , options: {
                "all" : "전체"
                , "0001": "공지사항"
                , "0002": "게시물"
                , "0002": "뉴스"
            }
        } 
        , {   type: 'radioType1'
            , name: '상태'
            ,  options: {
                "0001": "활성"
                , "0002": "비활성"
            }
        }
        , {   type: 'checkType1'
            , name: '추가옵션'
            ,  options: {
                "0001": "check1"
                , "0002": "check2"
            }
        }
        , { type: 'dateType1'
            , name: '시작일' 
        }
        , { 
            type: 'datePeriodType1'
            , name: '종료일' 

        }
        , {
            type: 'inputType1'
            , name: '검색어'
        }
    ]    
};
