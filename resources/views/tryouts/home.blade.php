@extends("template")

@push("head")
    <link rel="stylesheet" href="/assets/css/articles/list.css">
    <script src="/assets/js/articles/list.js" type="text/javascript"></script>
    <script src="/assets/js/search.js" type="text/javascript"></script>
@endpush

@section("contents")
    <div class="outside list-container">
        <div class="inside">
            {{--Section Header--}}
            <div class="section-header">
                <div class="section-title">
                    <span>
                        <div class="design-box"></div>
                        삽질 일기
                    </span>
                </div>
                <form id="search" onsubmit="return false" autocomplete="off">
                    <input type="text" id="search-input" class="search-bar" placeholder="검색어를 입력하세요." value="{{isset($_GET['keyword']) ? $_GET['keyword'] : ""}}" autofocus="true">
                    <button class="search-btn" data-input="search-input"></button>
                </form>
                @if(admin())
                    <a href="{{ route("tryouts.write") }}" class="post-btn f-right">
                        일지 작성하기 +
                    </a>
                @endif
            </div>
            {{--Section Body--}}
            <div class="section-body">
                <div class="bulletin-board">
                    <div class="head row">
                        <div class="col">No</div>
                        <div class="col">제목</div>
                        <div class="col">작성일</div>
                        <div class="col">조회수</div>
                    </div>
                    @forelse($tryouts as $tryout)
                    <div class="row" onclick="location.assign('{{route("tryouts.view", $tryout->id)}}')">
                        <div class="col">{{$tryout->id}}</div>
                        <div class="col">{{$tryout->title}}</div>
                        <div class="col">{{date("Y-m-d", strtotime($tryout->w_date))}}</div>
                        <div class="col">{{$tryout->v_count}}</div>
                    </div>
                    @empty
                        <p>일지가 존재하지 않습니다.</p>
                    @endforelse
                </div>
                <div class="board-tool">
                    <select class="board-sort o_select">
                        <option data-key="w_date" value="0"{{$order->key === "w_date" && $order->direction === "ASC" ? " selected" : ""}}>작성일: 오름차순</option>
                        <option data-key="w_date" value="1"{{$order->key === "w_date" && $order->direction === "DESC" ? " selected" : ""}}>작성일: 내림차순</option>
                        <option data-key="v_count" value="0"{{$order->key === "v_count" && $order->direction === "ASC" ? " selected" : ""}}>조회수: 오름차순</option>
                        <option data-key="v_count" value="1"{{$order->key === "v_count" && $order->direction === "DESC" ? " selected" : ""}}>조회수: 내림차순</option>
                    </select>
                    @if($pagination->start <= $pagination->end)
                        <div class="pagination">
                            @php($prev = $pagination->start - 1)
                            <a href="{{$prev >= 1 ? route("tryouts.home")."?".http_build_query(array_merge($_GET, ["page" => $prev])) : "#"}}" class="prev">
                                <svg focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
                                    <path fill="currentColor" d="M34.52 239.03L228.87 44.69c9.37-9.37 24.57-9.37 33.94 0l22.67 22.67c9.36 9.36 9.37 24.52.04 33.9L131.49 256l154.02 154.75c9.34 9.38 9.32 24.54-.04 33.9l-22.67 22.67c-9.37 9.37-24.57 9.37-33.94 0L34.52 272.97c-9.37-9.37-9.37-24.57 0-33.94z"></path>
                                </svg>
                            </a>

                            @for($i=$pagination->start;$i<=$pagination->end;$i++)
                                <a href="{{route("tryouts.home")."?".http_build_query(array_merge($_GET, ["page" => $i]))}}" class="page{{$i == $pagination->page ? " active" : ""}}">{{$i}}</a>
                            @endfor

                            @php($next = $pagination->end + 1)
                            <a href="{{$next <= $pagination->total ? route("tryouts.home")."?".http_build_query(array_merge($_GET, ["page" => $next])) : "#"}}" class="next">
                                <svg focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
                                    <path fill="currentColor" d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z"></path>
                                </svg>
                            </a>
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
@endsection