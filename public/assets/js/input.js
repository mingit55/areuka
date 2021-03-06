$(function(){
    function create(nodeText, parents = 'div'){
        var p_node = document.createElement(parents);
        p_node.innerHTML = nodeText;
        return p_node.firstChild;
    }


    /*
        사용자가 관리자 모드를 통해서 HTML 및 JS 코드를 바꿀 수 없도록 설정해야한다.
        또한, 각각의 input들은 별도로 분리되어 있어, 하나라도 입력이 올바르게 이뤄지지 않았다면,
        form은 전송시키지 말아야한다.

        @year :: 2018 ~ 2020
        @month :: 1 ~ 12
        @date :: 1 ~ 28(31) 각 날짜에 맞춰서 연동
    */
    var allow_submit = [];
    $.each($(".custom-date"), function(idx, item){
        $(item).attr("data-idx", idx);
        allow_submit.push(0);
    });
    function no_allow_submit(target){
        allow_submit[$(target).parents(".custom-date").data("idx")] = 0;
    }
    function in_allow_submit(target){
        allow_submit[$(target).parents(".custom-date").data("idx")] = 1;
    }
    function check_allow_submit(target){
        return allow_submit.reduce(function(acc, item){ return acc && item })
    }

    function check_valid_date(year, month, date){
        var min_date = new Date(2018, 0, 1);
        var max_date = new Date(2020, 11, 31);
        var form = new Date(year, month - 1, date);
        var m = form.getMonth() + 1;
        var wm = m < 10 ? "0" + m : m;
        var wd = form.getDate() < 10 ? "0" + form.getDate() : form.getDate();
        return (form.getFullYear() == year && m == month && form.getDate() == date) && (min_date <= form && form <= max_date ) ? form.getFullYear() + "-" + wm + "-" + wd : false;
    }

    /*
        Custom Input
    */
    var c_input = $(".custom-input > input");
    $.each(c_input, function(idx, item){
        if($(item).val().trim()) $(item).siblings(".bar").css("width", "100%");
    });

    c_input.on("keydown change focus", function(e){
        const target = e.target;
        var parents = $(this).parent();
        var value = e.target.value.trim();
        window.testParents = parents;

        /**
         *  Validator
         *
         */
        if(!parents.data("max"))
        {
            if(value.length > 0) $(this).siblings(".bar").css("width", "100%");
            else $(this).siblings(".bar").css("width", "0");
        }
        else
        {
            let max = parents.data("max");
            let name = parents.data("name");
            let message = parents.parents()[0].querySelector(".form-error");

            if(value.length < max) {
                if(value.length > 0) $(this).siblings(".bar").css("width", "100%");
                else $(this).siblings(".bar").css("width", "0");
                if(message) message.remove();
            }
            else {
                if(e.keyCode !== 8) e.preventDefault();
                e.target.value = e.target.value.substr(0, parseInt(max));
                $(this).siblings(".bar").css("width", "0");
                if(!message) {
                    value.length !== 0 && parents.parent().append($(`<p class="form-error inline">${name}은(는) ${max}자까지 작성하실 수 있습니다.</p>`));
                }
            }
        }

        /**
         * 연관 검색어 기능 추가
         */
        /* custom-input 에 연관 검색어 설정 (class 부여) 가 있다면 ... */
        if( parents[0].classList.contains("relate") ){
            // 에러 방지
            const table = parents.data("table");
            const c_key = parents.data("key"); // condition-key; // 조건의 컬럼
            const c_value = value + "%"; // condition-value; // 조건의 값

            if( !c_key || !c_value ) return;

            let relate_box = parents[0].querySelector(".relate-box");

            if( relate_box === null )
            {
                // 새로운 요소 생성
                parents.css("position", "relative");
                relate_box = document.createElement("div");
                relate_box.classList.add("relate-box");
                parents.append(relate_box);
            }
            else if(!value.length) {relate_box.innerHTML = ""; return; }

            // AJAX 요청
            (function (){
                return new Promise((res, rej) => {
                    let data = [
                        [c_key, "REGEXP",  "^" + value + ".+"],
                        [c_key, "<>", value]
                    ];

                    let xhr = new XMLHttpRequest();
                    xhr.open("POST", "/load/" + table);
                    xhr.setRequestHeader("Content-type", "application/json");
                    xhr.setRequestHeader("X-CSRF-TOKEN", document.querySelector("meta[name='csrf-token']").content);
                    xhr.send(JSON.stringify(data));
                    xhr.onload = () => res(JSON.parse(xhr.responseText));
                    xhr.onerror = () => rej(xhr.response);
                })
            })().then( data => {
                let list = [];
                data.splice(0, 5).forEach(x => {
                    if( !list.includes(x[c_key]) ) list.push(x[c_key]);
                });

                relate_box.innerHTML = '';
                list.forEach(item => {
                    let relate_item = document.createElement("div");
                    relate_item.classList.add("item");
                    relate_item.innerText = item;
                    relate_item.addEventListener("click", function(e){
                        target.value = $(e.target).text();
                        relate_box.innerHTML = '';
                    });

                    ( e.target.value.trim() !== "" && new RegExp("^"+ e.target.value.trim() +".+").test(item) && e.target.value.trim() !== item) && relate_box.append(relate_item);
                });
            });
        }

        /**
         * 방향키 위 아래로 검색어 선택할 수 있도록 설정
         */
        const box = e.target.querySelector(".relate-box");
        if(!box) return;
        if(e.keyCode !== 38 && e.keyCode !== 40) return;

        const item = box.querySelectorAll(".item");
        let offset = box.dataset.offset;
        if(!offset)
        {
            console.log(offset);
            offset = 1;
        }
    });


    /*
        Custom Textarea
    */
    var c_textarea = $(".custom-textarea > textarea");
    $.each(c_textarea, function(idx, item){
        if($(item).val().trim()) $(item).siblings(".bar").css("border-width", parseInt($(item).css("width"))+"px");
    });

    c_textarea.on("keyup keydown change click", function(e){
        var width = parseInt($(this).css("width"));
        var value = e.target.value.trim();
        if(value.length > 0) $(this).siblings(".bar").css("border-width", width + "px");
        else $(this).siblings(".bar").css("border-width", "0");
    });


    /*
        Tag-box
    */
    var tag_box = $(".tag-box .input");
    $.each(tag_box, function(idx, item){
        if($(item).parents(".input-area").siblings(".value").val().trim()) $(item).parents().siblings(".bar").css("border-width", parseInt($(item).parents(".tag-box").css("width"))+"px");
    });
    tag_box.on("keydown change click", function(e){
        /* 길이 제한 :: 100자 */
        var v_input = $(this).parents().siblings(".value");
        var v_value = v_input.val(); // value val()
        var v_valArr = v_value.split("|");
        this.value = this.value.substr(0, 20);

        /* 해시태그 입력 :: Tab, Space, Enter */
        if((e.keyCode === 32 || e.keyCode === 9 || e.keyCode === 13) && this.value !== ""){
            e.preventDefault();
            var i_value = this.value.trim().replace(/|/, ""); // input val
            var name = this.dataset.name;

            if(!i_value) return alert("내용을 입력하세요!");
            if(i_value.substr(0,1) === "#") i_value = i_value.substr(1);
            if(v_valArr.includes(i_value)) return alert("이미 등록된 "+name+" 입니다.");
            if(i_value.length > 20) return alert("최대 20자까지 작성할 수 있습니다.");
            if(v_valArr.length > 10) return alert("최대 10개까지만 등록 가능합니다.");
            this.value = null;

            i_value = name === "해시태그" ? "#"+i_value : i_value;
            if(!v_value) v_input.val(i_value);
            else {
                v_valArr.push(i_value);
                v_input.val(v_valArr.join("|"));
            }
            var span = create("<span class='v_tag'>"+i_value+"</span>");
            this.before(span);
            $(this).focus();
        }
        else if(e.keyCode === 8 && this.value === ''){
            e.preventDefault();
            $(this).prev().remove();
            v_valArr.pop();
            v_input.val(v_valArr.join("|"));
        }

        /* 입력값의 유무에 따라 애니메이션 */
        if(v_valArr.length === 0){
            $(this).parents().siblings(".bar").css("border-width", "0");
        }
        else {
            var width = parseInt($(this).closest(".tag-box").css("width"));
            $(this).parents().siblings(".bar").css("border-width", width + "px");
        }
    });

    /*
        input[type=file]
    */
    var f_input = $(".custom-file input[type='file']");
    var help_messages = [
        "해당 프로젝트의 실행 파일을 업로드 하세요!",
        "해당 문제의 풀이 파일을 업로드 하세요!"
    ];
    $.each(f_input, function(idx, item){
        var text = $(item).siblings("label:not(.upload-btn)").text().trim();
        if(text && !help_messages.includes(text)){
            var width = parseInt($(item).parents().css("width"));
            $(item).siblings(".upload-btn").css("backgroundImage", "url(/assets/images/icons/active-upload.png)");
            $(item).siblings(".bar").css("border-width", width+"px");
        }
        else {
            $(this).siblings(".upload-btn").css("backgroundImage", "url(/assets/images/icons/upload.png)");
            $(this).siblings(".bar").css("border-width", "0");
        }
    });
    f_input.on("change", function(e){
        var files = this.files;
        var width = parseInt($(this).parents().css("width"));
        if(files[0]){
            $(this).siblings("label:not(.upload-btn)").text(files[0].name);
            $(this).siblings(".upload-btn").css("backgroundImage", "url(/assets/images/icons/active-upload.png)");
            $(this).siblings(".bar").css("border-width", width+"px");
        }
    });

    var d_input = $(".custom-date");
    $.each(d_input, function(idx, item){
        var year = $(item).children(".year").children("input");
        var month = $(item).children(".month").children("input");
        var date = $(item).children(".date").children("input");
        var l_width = parseInt(year.parents().css("width"));
        var s_width = parseInt(month.parents().css("width"));
        if((year.val() && month.val() && date.val()) && check_valid_date(year.val(), month.val(), date.val())){
            year.siblings(".bar").css("border-width", l_width + "px");
            month.siblings(".bar").css("border-width", s_width + "px");
            date.siblings(".bar").css("border-width", s_width + "px");
        }
        else {
            year.siblings(".bar").css("border-width", "0");
            month.siblings(".bar").css("border-width", "0");
            date.siblings(".bar").css("border-width", "0");
        }
    });

    d_input.children(".year").children("input").on("change", function(e){ checkYear(e.target) });
    function checkYear(target){
        var i_month = $(target).parents().siblings(".month").children("input");
        var i_date = $(target).parents().siblings(".date").children("input");
        var l_width = parseInt($(target).parents().css("width"));
        var s_width = parseInt(i_month.parents().css("width"));

        /* 단일 체크 */
        var value = parseInt(target.value);
        if(!value || value < 2018 || value > 2020){
            $(target).siblings(".bar").css("border-width", "0");
            $(target).parents().siblings(".value").val('');
            no_allow_submit(target);
            return;
        }
        else {
            $(target).siblings(".bar").css("border-width", l_width);
        }

        /* 전체 체크 */
        if(value && i_month.val() && i_date.val()){
            var date = check_valid_date(value, i_month.val(), i_date.val());
            if(date !== false){
                $(target).siblings(".bar").css("border-width", l_width + "px");
                i_month.siblings(".bar").css("border-width", s_width + "px");
                i_date.siblings(".bar").css("border-width", s_width + "px");
                $(target).parents().siblings(".value").val(date);
                in_allow_submit(target);
                return;
            }
            else {
                $(target).siblings(".bar").css("border-width", "0");
                i_month.siblings(".bar").css("border-width", "0");
                i_date.siblings(".bar").css("border-width", "0");
                $(target).parents().siblings(".value").val('');
                no_allow_submit(target);
                return;
            }
        }
    }

    d_input.children(".month").children("input").on("change", function(e){ checkMonth(e.target) });
    function checkMonth(target){
        var i_year = $(target).parents().siblings(".year").children("input");
        var i_date = $(target).parents().siblings(".date").children("input");
        var l_width = parseInt(i_year.parents().css("width"));
        var s_width = parseInt($(target).parents().css("width"));

        /* 단일 체크 */
        var value = parseInt(target.value);
        if(!target.value || value < 1 || value > 12){
            $(target).siblings(".bar").css("border-width", "0");
            $(target).parents().siblings(".value").val('');
            no_allow_submit(target);
            return;
        }
        else {
            $(target).siblings(".bar").css("border-width", s_width);
        }

        /* 전체 체크 */
        if(i_year.val() && value && i_date.val()){
            var date = check_valid_date(i_year.val(), value, i_date.val());
            if(date !== false){
                i_year.siblings(".bar").css("border-width", l_width + "px");
                $(target).siblings(".bar").css("border-width", s_width + "px");
                i_date.siblings(".bar").css("border-width", s_width + "px");
                $(target).parents().siblings(".value").val(date);
                in_allow_submit(target);
                return;
            }
            else {
                i_year.siblings(".bar").css("border-width", "0");
                $(target).siblings(".bar").css("border-width", "0");
                i_date.siblings(".bar").css("border-width", "0");
                $(target).parents().siblings(".value").val('');
                no_allow_submit(target);
                return;
            }
        }
    }

    d_input.children(".date").children("input").on("change", function(e){ checkDate(e.target) });
    function checkDate(target){
        var i_year = $(target).parents().siblings(".year").children("input");
        var i_month = $(target).parents().siblings(".month").children("input");
        var l_width = parseInt(i_year.parents().css("width"));
        var s_width = parseInt($(target).parents().css("width"));

        /* 단일 체크 */
        var value = parseInt(target.value);
        if(!target.value || value > 31 || value < 1){
            $(target).siblings(".bar").css("border-width", "0");
            $(target).parents().siblings(".value").val('');
            no_allow_submit(target);
            return;
        }
        else {
            $(target).siblings(".bar").css("border-width", s_width);
        }

        /* 전체 체크 */
        if(i_year.val() && i_month.val() && value){
            var date = check_valid_date(i_year.val(), i_month.val(), value);
            if(date !== false){
                i_year.siblings(".bar").css("border-width", l_width + "px");
                i_month.siblings(".bar").css("border-width", s_width + "px");
                $(target).siblings(".bar").css("border-width", s_width + "px");
                $(target).parents().siblings(".value").val(date);
                in_allow_submit(target);
                return;
            }
            else {
                i_year.siblings(".bar").css("border-width", "0");
                i_month.siblings(".bar").css("border-width", "0");
                $(target).siblings(".bar").css("border-width", "0");
                $(target).parents().siblings(".value").val('');
                no_allow_submit(target);
                return;
            }
        }
    }

    $(".custom-date:not(.not_check)").closest("form").on("submit", function(e){
        $.each($(this).find(".custom-date"), function(idx, item) {
            checkYear($(item).children(".year").children("input")[0]);
            checkMonth($(item).children(".month").children("input")[0]);
            checkDate($(item).children(".date").children("input")[0]);
        });

        if(!check_allow_submit()){
            alert("올바른 날짜를 입력해 주세요!");
            e.preventDefault();
            return false;
        }
    });
});
