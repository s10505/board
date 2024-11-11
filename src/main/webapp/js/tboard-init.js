
// 페이지 로드 시 조회조건 요소 생성
document.addEventListener('DOMContentLoaded', () => {    
    debugger;
    const koshaTboard = KoshaTboard.init({
        bbsId: ""
        , channel: ""
    })
    /*.then((rtn) => {
        if (rtn.code === "-1") {
            alert(rtn.msg);
        }

        //koshaTboard.getNode();

    })*/;



    //화면에서 사용할 객체로 변환
    //const srchCondition = new SearchCondition(srchFieldInfo, datas);

    initDatePicker();
});



function initDatePicker() {
    log.log("pos1");
    //객체 추출

    // flatpickr("#datepicker", {
    //     locale: "ko",
    //     dateFormat: "Y-m-d",    // 예: 2024-11-06
    //     altFormat: "j F, Y",    // 예: 6 November, 2024
    // });

    flatpickr("#datepicker", {
        locale: "ko",           // 한글 로케일
        dateFormat: "Y-m",      // 연월만 선택
        minDate: "1900-01",     // 최소 연월
        maxDate: "2099-12",     // 최대 연월
        defaultDate: "2024-01", // 기본 연월
        clickOpens: false,      // 클릭 시 달력 열리지 않도록 설정
        onChange: function(selectedDates, dateStr, instance) {
          console.log("선택된 연월:", dateStr); // 예: 2024-01
        }
      });

    flatpickr("#datepicker2", {
        locale: "ko",         // 한글
        mode: "range",        // 날짜 범위 선택
        dateFormat: "Y-m-d",  // 날짜 포맷
      });


      $('#monthpicker').monthpicker({
        pattern: 'yyyy-mm',      // 연월 포맷
        minDate: new Date(1900, 0, 1), // 최소 연도
        maxDate: new Date(2100, 11, 31), // 최대 연도
      });



      var picker = new Pikaday({
        field: document.getElementById('Pikaday'),
        format: 'YYYY-MM',      // 연월 선택
        showMonthAfterYear: true, // 연도 뒤에 월 표시
        i18n: {                // 한글 로케일 설정
          previousMonth : '이전 달',
          nextMonth     : '다음 달',
          months        : ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
          weekdays      : ['일', '월', '화', '수', '목', '금', '토'],
          weekdaysShort : ['일', '월', '화', '수', '목', '금', '토']
        }
      });



}