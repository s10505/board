/*
koshaTboard.init(
bbsId: ""
, chl: ""
, fixSrchParam {
    "항목번호": "항목값"
  }
, initSrchParam {
    "항목번호": "항목값"
  }
    ,listSort : []
);
init 
- 입력값 설정
- initParam : {

}
- fixParam : {
    "항목번호" : "항목값"
}
*/




















let searchCnd = {
    bbsInfo: {
        channel: "" //web,admin,app,mobile
        , sysSeCd: "" //erp, portal/..
        , bbsId: ""
    }
    //"": "" //공지, 일반, 답변글
    , pstGroupNo: "" //답변글인경우
    , paiging: {
        pageCo: 1
        , pageSize: 10
    }
    , orDefault: {
       pstNm: ""
       , pstCn: ""
       , wrtrId: ""
       , wrtrNm: ""        
       , regYmd: "" 
       , editYmd: ""
    }
    , andDefault: {
        pstNm: ""
        , pstCn: ""
        , wrtrId: ""
        , wrtrNm: ""        
        , regYmd: ""  //20240101 or 20240101|20241010
        , editYmd: ""  //20240101 or 20240101|20241010
    }
    , orArtcl: [
        {artclNo: "D010001", value: "180000"}
        , {artclNo: "D010001", value: "180000"}
    ]
    , andArtcl: [
        {artclNo: "D010001", value: "180000"}
        , {artclNo: "D010001", value: "180000|180001|180002"}
        , {artclNo: "D040001", value: "20240101|20241010"} //날짜항목인경우만
    ]
    , sort: {
        field: "" //inqCnt,  pstNm, reqYmd
        , order: "" //desc, asc
    }
};


let result = {
    notice: [{}]
    , default: [{
    }]
    //, artclInfo: [{}]
    , atcfl: [{pstNo:"20240101xds", atfclArtclNo: "D0800010", atfchlYn: "Y"}]
    , paging: {
        totalCnt: ""
    }

}




let searchCnd2 = {
     pstNo: "" //답변글인경우    
};


let result2 = {
    default: [{

    }]
    , reply: [{

    }],
    atcfl: [{
        pstNo: ""
        , atcflArtclNo: ""
        , atcflNm: "제목"
        , atcflSize: "10000" //
    }]
}

let result3 = {
    atcfl: [{
        pstNo: ""
        , atcflArtclNo: ""
        , atcflNm: "제목"
        , atcflSize: "10000" //

    }]
}


//fileDownload
let downCnd = {
    atcfl: {
        type: "All" //zip압축, 
        , atcflArtclNo: "D0800001"
        , pstNo: ""
    }
};


//fileDownLoad
/*let downCnd = {
    result: {
        key: ""
        , data: ""
    }
};*/




/*



//비로그인 사용자 흐름도
포털진입 -> 토큰없음 -> 메뉴클릭 -> vue화면오픈 -> 게시판요청

-> 게시판js -> permission 호출 -> 통합게시판 controller 진입

-> (1)게시판아이디로 권한변경 조회(날짜)

-> (2)세션체크 - 로그인여부체크  <=========================== 시스템에 맞춰 token, httpSession, token은 header에 담아서 request로 처리

-> 비로그인

-> (3)시스템코드+게시판아이디로 redis 호출

   -> (3-1)redis에 값이 있으면

       -> (5) 권한변경날짜 비교

           -> (5-1)권한 변경없으면 

                -> (9)로 이동
 
           -> (5-2)권한 변경있으면 
                -> (7)로 이동

   -> (3-2)redis에 값이 없으면 

       -> (7) KDC호출 : 권한객체 조회
    
       -> (8) 시스템코드+게시판아이디로 권한객체 Redis에 저장

-> (9) 권한/항목 객체 화면으로 내림 -> 권한/항목에 맞춰 렌더링됨




-> 로그인

-> (3)사용자아이디 + 시스템코드 + 게시판아이디로 redis 호출

   -> (3-1)redis에 값이 있으면

       -> (5) 권한변경날짜 비교

           -> (5-1)권한 변경없으면 

                -> (9)로 이동
 
           -> (5-2)권한 변경있으면 
                -> (7)로 이동

   -> (3-2)redis에 값이 없으면 

       -> (7) KDC호출 : 권한객체 조회
    
       -> (8) 시스템코드+게시판아이디로 권한객체 Redis에 저장

-> (9) 권한/항목 객체 화면으로 내림 -> 권한/항목에 맞춰 렌더링됨



==>API 호출


//hasPermission(authKey) 







*/