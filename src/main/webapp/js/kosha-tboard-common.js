(function() {
    let tboardUtil    = undefined;
    let tboardImgUtil = undefined;
    let tboardMsg     = undefined;
    let tboardConfig  = undefined;
    let tboardMng     = undefined;

    let KOSHATboard = class {
        static instance;
        constructor(_tboardType) {
            //값이 있으면 기존값 리턴
                if (KOSHATboard.instance) {
                return KOSHATboard.instance;
            }            
            //값이 없으면 생성 객체 입력
            KOSHATboard.instance = this;
            
            this.isSrcLoading    = false;
			this.isLoadConfigCnt = 0;
			this.tboardType = _tboardType || 'default';
            this.token;
            this.create();
        }

        setToken(_token) {
            this.token = _token;
        }

        create() {
			try {
	            if (this.isLoadConfig() === false) {
	                return;
	            }
	            
	            this.isResourceLoad = false; 
	            
	            //설정객체
	            this.configInstance = new TboardConfig( this.tboardType );
	            this.config = this.configInstance.config;
	            
	            //ajax객체
	            this.tAjax = new TboardAjaxManager();
	
	            //화면객체
	            this.elementsInstance = new TboardElements( this.tboardType );
	            this.elements = this.elementsInstance.elements;
	
	            //유니크 아이디 별 게시판 객체
	            this.bbsInfo = {};
	            this.idMap = {};
	            this.#load();
            }
            catch(error) {
				console.error(error);
			}
            
            try {
                let orinFn = nexacro._stopSysEvent;
                if (typeof orinFn === "function") {
                    nexacro._stopSysEvent = function(...args) {
                        let isTboardEl = false;
                        try {
                            if (args[0].target.closest("[data-tboard-page-id]")) {
                                isTboardEl = true;
                            }
                        }
                        catch(error) {
                            isTboardEl = true;
                        }
                        if (isTboardEl === false) {
                            orinFn.apply(null, args);
                        }
                    }
                }
                this.nexacro = true;
            }
            catch(error) {
                this.nexacro = false;            
            }
        }

        isLoadConfig() {
			if (this.isLoadConfigCnt > 10) {
				console.error("error - load stdtboard config");
				throw new Error("error - load stdtboard config");
			}
            
            if (typeof window.$ === "undefined" || typeof window.StdTboardConfig === "undefined") {            
                setTimeout(() => {
                    this.isLoadConfigCnt = this.isLoadConfigCnt + 1; 
                    this.create();
                }, 500);

                return false;
            }
            return true;
        }

        async #load() {
            try {


                //web 리소스 불러오기
                await this.#loadResource();      
                               
                //html 로드 후 세부적인 객체 생성
                this.elementsInstance.build();
                
                this.isSrcLoading = true;
                //console.log("=================> load completed");
            } catch (error) {
                this.isSrcLoading = false;
                console.error("------------------------------------------------------통합게시판 오류");
                console.error(error);
            }
        }

        //리소스 불러오기
        async #loadResource() {
            let arrHtmlPromise = [];
            let arrScriptPromise = [];
            let loadScript = () => {                
                let contextPath = this.config.contextPath;
                let rootPath   = this.config.resource.rootPath;
                let objScript  = this.config.resource.script;
                let version    = this.config.resource.version;

                //html 정의된 만큼 요청(search, detail, write)
                Object.keys(objScript).forEach( _key => {
                    let scriptURL = objScript[ _key ];
                    if (!scriptURL) {
                        return;
                    }

                    //html 요청 promise
                    let PromiseFn = new Promise((resolve, reject) => {
                        let ajaxSetting = {
                            url: contextPath + rootPath + scriptURL + "?" + version
                            , type: "GET"
                            , dataType: "script"
                            , successCallbackFn: function() {                                
                                try {
                                    resolve();
                                }
                                catch(error) {
                                    console.error("load script : ", rootPath + scriptURL + "?" + version);
                                    reject(error);
                                }
                            }
                        }

                        this.tAjax.ajax(ajaxSetting);
                    }); //PromiseFn end

                    //html 요청 전체 promise
                    arrScriptPromise.push(PromiseFn);
                });
                
            },
            loadStyle = () => {
                let headerNode = document.getElementsByTagName('head')[0];
                let contextPath = this.config.contextPath;
                let rootPath   = this.config.resource.rootPath;
                let sitePath   = this.config.resource.sitePath;
                let objStyle   = this.config.resource.style;
                let version    = this.config.resource.version;

                //css 정의된 만큼 요청
                Object.keys(objStyle).forEach( _key => {
                    let styleURL = objStyle[ _key ];

                    if (!styleURL) {
                        return;
                    }

                    let styleLinkNode = document.createElement('link');
                    styleLinkNode.rel ="stylesheet";
                    styleLinkNode.type = 'text/css';
                    styleLinkNode.href = contextPath + rootPath + sitePath + styleURL + "?" + version;
                    headerNode.appendChild(styleLinkNode);
                });
            },
            loadLib = () => {
                Object.keys(this.config.resource.lib).forEach( _key => {
                    //let lib    = this.config.resource.lib.quill;
                    let objLib = this.config.resource.lib[ _key ];

                    this.idMap[_key] = this.idMap[_key] || {};
                    let headerNode = document.getElementsByTagName('head')[0];
                    let contextPath = this.config.contextPath;
                    let rootPath   = this.config.resource.rootPath;                    
                    let libPath    = objLib.path;
                    let libScript  = objLib.script || {};
                    let libStyle   = objLib.style  || {};
                    let version    = objLib.version;

                    Object.keys(libScript).forEach( _script => {
                        this.idMap[_key]["script"] = this.idMap[_key]["script"] || {};
                        //this.idMap[_key]["script"][_script] = _script;
                        let savedLoaded = this.idMap[_key]["script"];
                        let loadedKey   = _script;
                        
                        let libFilePath = libScript[_script];
                        let ajaxSetting = {
                            url: contextPath + rootPath + libPath + libFilePath + "?" + version
                            , type: "GET"
                            , dataType: "script"
                            , async: false
                            , successCallbackFn: function() {
                                savedLoaded[loadedKey] = loadedKey;
                            }
                        }

                        this.tAjax.ajax(ajaxSetting);
                    });

                    Object.keys(libStyle).forEach( _style => {
                        this.idMap[_key]["style"] = this.idMap[_key]["style"] || {};
                        this.idMap[_key]["style"][_style] = _style;

                        let libFilePath = libStyle[_style];

                        let styleLinkNode = document.createElement('link');
                        styleLinkNode.rel ="stylesheet";
                        styleLinkNode.type = 'text/css';
                        styleLinkNode.href = contextPath + rootPath + libPath + libFilePath + "?" + version;
                        headerNode.appendChild(styleLinkNode);

                    });
                });

            },

            loadHTML = () => {
                let contextPath = this.config.contextPath;
                let rootPath   = this.config.resource.rootPath;
                let objHtml    = this.config.resource.html;
                let version    = this.config.resource.version;

                //html 정의된 만큼 요청(search, detail, write)
                Object.keys(objHtml).forEach( _htmlType => {
                    let htmlURL = objHtml[ _htmlType ];
                    if (!htmlURL) {
                        return;
                    }

                    //html 요청 promise
                    let PromiseFn = new Promise((resolve, reject) => {
                        let ajaxSetting = {
                            url: contextPath + rootPath + htmlURL + "?" + version
                            , type: "GET"
                            , dataType: "html"
                            , successCallbackFn: function(_strHtml) {
                                try {
                                    let htmlDoc = parseStringToDom(_strHtml); //string to document
                                    removeScriptTag(htmlDoc); //script tag 제거

                                    //요청결과
                                    let rtnData = {
                                        procType : "html"
                                        , htmlType : _htmlType
                                        , dom : htmlDoc
                                    }

                                    resolve(rtnData);
                                }
                                catch(error) {
                                    console.error("load html : ", rootPath + htmlURL);
                                    reject(error);
                                }
                            }
                        }

                        this.tAjax.ajax(ajaxSetting);
                    }); //PromiseFn end

                    //html 요청 전체 promise
                    arrHtmlPromise.push(PromiseFn);
                });
            },
            parseStringToDom = (_strHtml) => {
                return new DOMParser().parseFromString(_strHtml, "text/html");
            },
            removeScriptTag = (_dom) => {
                let scripts = _dom.querySelectorAll("script");
                scripts.forEach(script => {
                    script.parentNode.removeChild(script);
                });
            }

            //resource load
            return (() => {
                loadScript();                
                loadStyle();
                loadLib();
                loadHTML();
                
                //resource 요청 전체 수행 결과
                let rtnPromise = 
                Promise.all(arrScriptPromise)
                .then(async () => {
                    const arrResource = await Promise.all(arrHtmlPromise);
                    arrResource.forEach(_resource => {
                        let procType = _resource.procType;
                        let htmlType = _resource.htmlType; //search, detail, write
                        let htmlDoc = _resource.dom;

                        //불러온 html document 세팅
                        if (procType.toLowerCase() === "html") {
                            this.elements.html[htmlType] = htmlDoc;
                        }
                    });
                })
                .catch(error => {
                    throw new Error("error - loadResource : ", error);
                })
                return rtnPromise;
            })();
        }

        getViewCloneNode(_type) {
            if (this.elements.view[_type] && this.elements.view[_type] instanceof Node) {
                return this.elements.view[_type].cloneNode(true);
            }
        }

        //게시판 시작
        async init(_args) {            
            return new Promise((resolve, reject) => {
                if (this.isSrcLoading === false) {
                    //KOSHATboard 객체 생성 동시에 init 하는 경우 리소스 로드 후 실행
                    setTimeout(() => {                    
                        this.init(_args).then((_rtn) => {
                            resolve(_rtn);
                        });
                    }, 500);
                    return;
                }
            
                let rtnData = {
                    code: 0
                    , msg: tboardMsg.getMsg("msg_000")
                }
                try {
                    //게시판 생성
                    let tboard = new Tboard();
                    tboard.build(_args)
                    .then((_rtnData) => {
                        if (_rtnData.code < 0) {                            
                            //오류코드
                            rtnData.code = _rtnData.code;
                            rtnData.msg = _rtnData.msg;
                            return;
                        }

                        //정상 - 게시판 생성 정보 등록
                        this.bbsInfo = {
                            uuid: tboard.uuid
                            , tboard: tboard
                        }
                        
                    })
                    .catch(error => {
                        //console.log(error);
                        rtnData.code = -1;
                        rtnData.msg = tboardMsg.getMsg("msg_900");
                    })
                    .finally(() => {
                        //결과반환
                        resolve(rtnData);
                        //callback 반환
                        if (typeof _args.callback === "function") {
                            _args.callback(rtnData);
                        }
                    });

                } catch (error) {
                    //console.log("------------------------------> ", error)
                    rtnData.code = -1;
                    rtnData.msg = tboardMsg.getMsg("msg_900");
                    resolve(rtnData);
                }
            });
        }

        callApi(_args) {
            this.api = new TboardApi(_args);
            return this.api.call();
        }
    },
    TboardApi = class {
        constructor(_args) {
            //ajax객체
            this.tAjax     = new TboardAjaxManager();
            this.data      = _args.data || {};
            this.callback  = _args.callback;
            this.dataset   = _args.dataset || {};
            this.serviceId = "";
            this.parent    = _args.parent || {};
        }

        checkParam(_data) {
            //시스템코드, 채널코드 없으면 기본값
            this.data.common.siteCode = this.data.common.siteCode || tboardConfig.systemCd;
            this.data.common.channelType = this.data.common.channelType || tboardConfig.defaultChannel;
            
            let rtnMsg = "";
            if (!this.data.common.boardId) {                
                rtnMsg = tboardMsg.getMsg("msg_901");
            }
            if (!this.data.common.serviceId) {
                rtnMsg = tboardMsg.getMsg("msg_701");
            }

            if (this.data.common.serviceId === "boardList") {
                this.data.common.pagingInfo.curPageCo = this.data.common.pagingInfo.curPageCo || "1";
                this.data.common.pagingInfo.rowsPerPage = this.data.common.pagingInfo.rowsPerPage || "10";

                this.data.data.sortType = this.data.data.sortType || "01";
                this.data.data.sortOrder = this.data.data.sortOrder || "0";
            }
            else if (this.data.common.serviceId === "boardDetail") {
                if (!this?.data?.data?.pstNo) {
                    rtnMsg = tboardMsg.getMsg("msg_702");
                }
            }
            else if (this.data.common.serviceId === "fileDown") {
                if (!this?.data?.data?.pstNo) {
                    rtnMsg = tboardMsg.getMsg("msg_703", ["게시물번호"]);
                }
                else if (!this?.data?.data?.bbsAtcflNo) {
                    rtnMsg = tboardMsg.getMsg("msg_703", ["첨부파일번호"]);
                }
                this.data.data.artclNo = "D080100001";
            }
            return rtnMsg;
        }

        addDataset(dataset, dataList) {
            if (Object.keys(dataset).length < 1) {
                return;
            }
            if (Array.isArray(dataList) === false) {
                return;
            }

            //
            if (dataList.length < 1) {
                dataset.clearData();
                return;
            }
            dataset.clear();

            let dataKey = {};
            for(let data of dataList) {
                Object.keys(data).forEach( _key => {
                    dataKey[_key] = "";
                });
            }
            //데이터 셋 키 추가
            Object.keys(dataKey).forEach( _key => {
                dataset.addColumn(_key, "STRING", 255);
            });
            //데이터 셋에 데이터 추가
            for(let data of dataList) {
                let newRow = dataset.addRow();

                Object.keys(data).forEach( _key => {
                    dataset.setColumn(newRow, _key, data[_key]);
                });
            }
            if (dataset.rowcount > 0) {
                dataset.set_rowposition(0);
            }
        }

        setDataset(_data) {
            if (Object.keys(this.dataset).length < 1) {
                return;
            }

            try {
                if (this.serviceId === "boardList") {                
                    let listKey = this.dataset.list;
                    let dsList = this.parent[listKey];
                    let boardList = _data.boardList || [];
                    this.addDataset(dsList, boardList);
                }
                else if (this.serviceId === "boardDetail") {
                    let dtlKey     = this.dataset.detail;
                    let fileKey    = this.dataset.file;
                    let dsDetail   = this.parent[dtlKey];
                    let dsFileList = this.parent[fileKey];

                    let boardDetail = [];
                    let boardfileList = _data.fileList || [];
                    if (Object.keys(_data.boardDetail).length > 0) {
                        boardDetail.push(_data.boardDetail);
                    }
                    this.addDataset(dsDetail  , boardDetail);
                    this.addDataset(dsFileList, boardfileList);
                }
            }
            catch(error) {
                return;
            }            
        }

        fileDownLoad(_data) {
            let data = _data?.fileDownInfo?.data || "";
            let key  = _data?.fileDownInfo?.key || "";
            if (!data || !key) {
                return;
            }
            let filedownUrl = `${tboardConfig.ajaxUrl.root}${tboardConfig.ajaxUrl.filedown}?data=${data}&key=${key}`;
            window.location.href = filedownUrl;
        }
        
        call() {
            this.serviceId = this.data.common.serviceId;            
            let callbackFn = this.callback;
            let self = this;
            return new Promise((resolve, reject) => {
                //결과반환
                let rtnMsg = self.checkParam();
                if (rtnMsg) {
                    let rtnData = {code : -1, msg: rtnMsg, serviceId: self.serviceId};
                    resolve(rtnData);
                    if (typeof callbackFn === "function") {
                        callbackFn(rtnData);
                    }
                    return;
                }                

                let setting = {
                    url : tboardConfig.ajaxUrl.root + tboardConfig.ajaxUrl.api
                    , type : "POST"
                    , dataType : "json"
                    , contentType : "application/json;charset=UTF-8"
                    , apiData: self.data || {}
                    , isApi: true                
                    , successCallbackFn: (_result) => {
                        try {
                            let rtnData = {code : 0, msg: "", serviceId: self.serviceId};
                            if (_result.common.result.code != "200" || _result.common.result.subMsg) {
                                rtnData.code = -1;
                                rtnData.msg = _result.common.result.subMsg;                                
                                resolve(rtnData);
                                
                                
                                if (typeof callbackFn === "function") {
                                    callbackFn(rtnData);
                                }
                            }
                            else {
                                _result.code = 0;
                                _result.msg = "";
                                _result.serviceId = self.serviceId;

                                if (this.serviceId === "boardList") {
                                    if (_result.data.boardList.length > 0) {
                                        tboardUtil.arraySort(_result.data.boardList, "rnum", true);
                                    }
                                }
                                
                                //데이터셋 epr용
                                self.setDataset(_result.data);

                                //결과
                                resolve(_result);      
                                if (typeof callbackFn === "function") {
                                    callbackFn(_result);
                                }
                                if (self.serviceId === "fileDown") {
                                    self.fileDownLoad(_result.data);
                                }
                            }
                        }
                        catch(error) {
                            let rtnData = {code : -1, msg: tboardMsg.getMsg("msg_700"), serviceId: self.serviceId};
                            resolve(rtnData);
                            if (typeof callbackFn === "function") {
                                callbackFn(rtnData);
                            }
                        }
                    },
                    errorCallbackFn: (error) => {
                        let rtnData = {code : -1, msg: tboardMsg.getMsg("msg_700"), serviceId: self.serviceId};
                        resolve(rtnData);
                        if (typeof callbackFn === "function") {
                            callbackFn(rtnData);
                        }
                    }               
                };
                self.tAjax.ajax(setting);
            });
        }

    },

    TboardAjaxManager = class {
        static instance;
        
        constructor() {
            //값이 있으면 기존값 리턴
            if (TboardAjaxManager.instance) {
                return TboardAjaxManager.instance;
            }
            //값이 없으면 생성 객체 입력
            TboardAjaxManager.instance = this;            
            this.info = {};
            this.siteToken = tboardMng?.token || "";
        }

        setToken(_token) {
            this.siteToken = _token;
        }
            
        setAjaxLog(_bbsId, _ajaxService) {
            let bbsId = _bbsId || 'global';

            //초기화
            this.info[bbsId] = this.info[bbsId] || {};
            
            //로그 등록
            let sequenceId = (this.info[bbsId].sequenceId || 0) + 1;
            this.info[bbsId].sequenceId = sequenceId;
            this.info[bbsId][sequenceId] = {
                time : new Date(), 
                ajaxService : _ajaxService
            }
        }

        createAjax(_bbsId) {
            let ajaxService = new this.ajaxService(this);            
            //ajax log
            this.setAjaxLog(_bbsId, ajaxService);
            return ajaxService;
        }

        ajax(_setting) {
            let ajax = this.createAjax();
            ajax.setAjaxSetting(_setting);
            ajax.execute();
        }

        ajaxService = class {
            constructor(_instance) {
                this.ajaxManager = _instance;
                this.config = new TboardConfig().config;

                this.uuid = "";
                this.type = "POST";
                this.url = "";
				this.async = true;
				this.cache = true;
				this.dataType = "text"; //html,script,json,text,xml
				this.contentType = "";
                this.needEncode  = true;
				this.ajaxSetup = {};                
				this.input = {};
				this.output = {};
				this.option = {};
                this.tboardCommonInfo = {};
				this.isProgress = false;
                this.header = {};
                this.apiData = {};
                this.isApi   = false;
                
                //multipart
                this.formData = false;
                this.isMultipart = false;

				this.inputDataFn = undefined;
				this.outputDataFn = undefined;		
				this.successCallbackFn = undefined;
				this.errorCallbackFn = undefined;
				this.completeCallbackFn = undefined;
                this.beforeSendFn = undefined;
            }

            setBeforSend(_beforeSendFn) {
                this.beforeSendFn = _beforeSendFn;                
            }

            processSession(_xhr) {
                if ((this.config.sessionInfo.type || "").toLowerCase() === "token") {                            
                    let sessionFn;
                    try {
                        try {
                            let token = tboardMng?.token || "";
                            if (token) {
                                const jwtAccessToken = token;
                                if (jwtAccessToken) {
                                    _xhr.setRequestHeader("Authorization", `Bearer ${jwtAccessToken}`);
                                }
                            }
                            else {
                                const jwtAccessToken = sessionStorage.getItem('jwt-access-token');
                                if (jwtAccessToken) {
                                    _xhr.setRequestHeader("Authorization", `Bearer ${jwtAccessToken}`);
                                }
                            }
                        }
                        catch(error) {
                            console.log(error);
                        }

                    } catch(e) {
                        sessionFn = null;
                    }
                }
            }

            setAjaxSetting(_setting) {
                Object.keys(_setting).forEach(_key => {
                    //정의 되어 있는 것만
                    if (this.hasOwnProperty(_key) === false) {
                        return;
                    }

                    this[ _key ] = _setting[ _key ];
                });
            }

			setCommonParam() {
				let commonParam = {
					frontInfo: {
						viewId: "",
						menuId: "",
						siteId: ""
					},
					frontAuthKey: "",
					auth: {
	
					},
					securityInfo: {},
					data: {
						pagingInfo: null,
						whereId: null,
                        tboard: {

                        }
					}
				};
				
                //통합게시판 용 공통 정보
                commonParam.data.tboard = tboardUtil.objectExtend(commonParam.data.tboard, this.tboardCommonInfo);

                //setCommonParam.frontInfo = tboardUtil.objectExtend(setCommonParam.frontInfo, this.frontInfo);
                //setCommonParam.frontInfo = tboardUtil.objectExtend(setCommonParam.frontInfo, this.frontInfo);
                //setCommonParam.frontInfo = tboardUtil.objectExtend(setCommonParam.frontInfo, this.frontInfo);
                //setCommonParam.frontInfo = tboardUtil.objectExtend(setCommonParam.frontInfo, this.frontInfo);
                //setCommonParam.frontInfo = tboardUtil.objectExtend(setCommonParam.frontInfo, this.frontInfo);
				return commonParam;
			}
			
			setServiceParam() {
                let serviceParam = {
                    info: {
                        id : "",
                        type : ""
                    },
                    data: this.input || {}
                }
                
				return serviceParam;
			}

            setParam() {
                let encParam = {};
                let param = {};
				if (this.type.toUpperCase() === 'POST') {
					param = {
						common  : this.setCommonParam(),
						service : this.setServiceParam()
					};
	
					try {
						encParam = { "_JSON": encodeURIComponent(JSON.stringify(param)).replace(/\'/g,"%27")};
					} catch (e) {
						encParam = { "_JSON": encodeURIComponent("{}") };
					}
				}

                return encParam;
            }

            getFormData() {
                let param = {
					common  : this.setCommonParam(),
					service : this.setServiceParam()
				};
	
                if (!this.formData || !(this.formData instanceof FormData)) {
                    this.formData = new FormData();
                }

                for (let [key, value] of this.formData.entries()) {
                    //console.log(`${key}`, value);
                }

                try {
                    this.formData.append("_JSON", encodeURIComponent(JSON.stringify(param)).replace(/\'/g,"%27"));
				} catch (e) {
                    this.formData.append("_JSON", encodeURIComponent(JSON.stringify({})).replace(/\'/g,"%27"));
				}

                return this.formData;
            }

			execute() {
				let _ajaxSelf = this;
                let objSetting = {
					type : _ajaxSelf.type || "POST",
					url : _ajaxSelf.url,
					async : _ajaxSelf.async,
					cache : _ajaxSelf.cache,					
					beforeSend: function(xhr) {
                        //let app = document.querySelector("[id='app']");
						//let loader = document.createElement("div");
						//loader.classList.add("popup");
						//loader.classList.add("loader");
						//loader.id = "tboard_loader";
						
						//let span = document.createElement("span");
						//loader.appendChild(span);
						//app.appendChild(loader);		
						if (_ajaxSelf.isProgress) {
							
						}
                        _ajaxSelf.processSession(xhr);
					}
					//contentType: "application/json",
					//headers: _ajaxSelf.header,
					//timeout: _ajaxSelf.timeout,
				};

                //데이터설정
                if (_ajaxSelf.isMultipart) {
                    objSetting.data = _ajaxSelf.getFormData();
                    objSetting.processData = false;
                    objSetting.contentType = false;
                    objSetting.enctype = 'multipart/form-data';
                }
                else {
                    if (this.isApi) {
                        objSetting.data = JSON.stringify(_ajaxSelf.apiData);
                        objSetting.contentType = _ajaxSelf.contentType;
                    }
                    else {
                        objSetting.data = _ajaxSelf.setParam();
                    }                    
                    objSetting.dataType = _ajaxSelf.dataType;
                }

                let fnSuccess = function(data, status, xhr) {
					if (typeof _ajaxSelf.successCallbackFn === 'function') {
						_ajaxSelf.successCallbackFn(data, status, xhr);
					}
				},				
				fnError = function(xhr, status, error) {					
					if (typeof _ajaxSelf.errorCallbackFn === 'function') {
						_ajaxSelf.errorCallbackFn(xhr, status, error);
					}
                    else {
                        console.error("ajax errorFn : ", status);
                    }
				},				
				fnComplete = function(xhr, status) {
                    //let tboardLoader = document.querySelector("[id='tboard_loader']");
					//if (tboardLoader) {
						//tboardLoader.remove();
					//}
					if (typeof _ajaxSelf.completeCallbackFn === 'function') {
						_ajaxSelf.completeCallbackFn(xhr, status);
					}
				};

                $.ajax(objSetting)
                .done(function(data, status, xhr) {
                    //console.log("Request succeeded");
                    fnSuccess(data, status, xhr);
                })
                .fail(function(xhr, status, error) {
                    //console.log("Request failed");
                    fnError(xhr, status, error);
                })
                .always(function(xhr, status) {
                    //console.log("Request completed");
                    if (_ajaxSelf.isProgress) {
                        
                    }
                    fnComplete(xhr, status);	
                });


			}
        }
    },

    TboardConfig = class {
        static instance;
        constructor(_type) {
            //값이 있으면 기존값 리턴
            if (TboardConfig.instance) {				
                return TboardConfig.instance;
            }
            //값이 없으면 생성 객체 입력
            TboardConfig.instance = this;

            this.type   = _type || "default";
            this.config = {};
            this.setConfig(_type);
        }

        setConfig(_type) {
            window.StdTboardConfig(this);
            tboardConfig = this.config;            
        }        
    },
    TboardElements = class {
        static instance;
        constructor(_type) {
            //값이 있으면 기존값 리턴
            if (TboardElements.instance) {
                return TboardElements.instance;
            }
            //값이 없으면 생성 객체 입력
            TboardElements.instance = this;

            //타입
            this.type = _type || "default";
            
            //기본객체 -> 객체를 타입 별 복사해서 동적으로 화면에 추가
            this.elements = {
                root : {},
                html : {},
                view : {
                    searchType1: null
                    , searchType2: null
                    , searchType3: null
                    , detailType1: null
                    , detailType2: null
                    , writeType1: null
                },
                searchType1 : {},
                searchType2 : {},
                searchType3 : {},
                detailType1 : {},
                detailType2 : {},
                writeType1 : {}
            };
            this.tagMap = this.getTagMap();
        }

        build() {
            //html 중 root 객체
            //this.setRootElement();

            //조회, 상세, 등록 화면
            this.setViewElement();

            //조회화면 동적 조회조건 항목 (type1 ~ type8)
            this.extractArtclElement();
        
            //조회, 상세, 등록 화면 불필요 노드 삭제
            this.initViewElement();
        }

        //화면 타입 별 객체 생성(list, gallery, faq는 한 파일에 1뎁스 div에 tboard-view-type으로 구분)
        setViewElement() {
            let tbViewType = this.tagMap.dataset.tbViewType; //root 하위의 1뎁스 화면 (화면 타입 구분), data-tboard-view-type
            let tbViewSubType = this.tagMap.dataset.tbViewSubType;
            Object.keys(this.elements.html).forEach( _key => {
                let htmlId = _key;
                
                if ((this.elements.html[ htmlId ] instanceof Node) === false) {
                    return;
                }

                //요소 구분값
                this.elements.html[htmlId].querySelectorAll("input,select").forEach(el=> {
                    el.dataset.tboardEl = "Y";
                });

                let rootNode = this.elements.html[ htmlId ];
                let viewTypeNodes = rootNode.querySelectorAll(`[${tbViewType}]`);
                viewTypeNodes.forEach( _viewNode => {
                    let viewType = _viewNode.dataset.tboardViewType;
                    if (viewType.split("|").length === 1) {
                        this.elements.view[ viewType ] = _viewNode.cloneNode(true);
                        return;
                    }

                    //searchType1, searchType2, searchType3
                    viewType.split("|").forEach( _subViewType => {
                        let tempNode = _viewNode.cloneNode(true);

                        let subNodes = tempNode.querySelectorAll(`[${tbViewSubType}]`);
                        Array.from(subNodes).forEach( _node => {
                            //all 공용, viewType이 다르면 삭제
                            if ( ['all', _subViewType ].includes( this.getAttrValue(_node, tbViewSubType) ) == false ) {
                                _node.remove();
                            }
                        });

                        this.elements.view[ _subViewType ] = tempNode;
                    });
                });
            });
        }

        extractArtclElement() {

            let tbFieldType = this.tagMap.dataset.tbFieldType; //각 화면 별 개별 컴포넌트(data-tboard-fld-type)
            let tbFieldGrpType = this.tagMap.dataset.tbFieldGrpType;
            //_key : searchType1, searchType2, detailType1, detailType2, writeType1
            Object.keys(this.tagMap.view).forEach( _key => {
                //view 값이 없으면 다음(setRootElement에서 만들어진 객체)
                if (!this.elements.view[ _key ]) {
                    return;
                }

                let viewNode = this.elements.view[ _key ]; //타입별 화면
                let fldNodes = viewNode.querySelectorAll(`[${tbFieldType}]`);

                Array.from(fldNodes).forEach(_fldNode => {
                    let fldTypeId = this.getAttrValue(_fldNode, tbFieldType);
                    //초기화
                    this.elements[ _key ] = this.elements[ _key ] || {};

                    let fldGrpId = fldTypeId.split(".")[0];
                    let fldId    = fldTypeId.split(".")[1];
                    
                    this.elements[ _key ][ fldGrpId ] = this.elements[ _key ][ fldGrpId ] || {};

                    //필드 추가
                    this.elements[ _key ][ fldGrpId ][ fldId ] = _fldNode;

                    //grp노드
                    if (!this.elements[ _key ][ fldGrpId ].root) {                        
                        let selector = `[${tbFieldGrpType}="${fldGrpId}"]`;
                        //console.log(selector);
                        if (viewNode.querySelector(selector)) {
                            this.elements[ _key ][ fldGrpId ].root = viewNode.querySelector(selector).cloneNode(true);
                            this.initGrpNode( this.elements[ _key ][ fldGrpId ].root );
                        }
                    }
                });
            });
        }

        //동적으로 항목이 붙는 영역 - 하위노드 삭제
        initViewElement() {
            let tbFieldGrpType = this.tagMap.dataset.tbFieldGrpType; 
            //_key : searchType1, searchType2, detailType1, detailType2, writeType1
            Object.keys(this.tagMap.view).forEach( _key => {
                //view 값이 없으면 다음(setRootElement에서 만들어진 객체)
                if (!this.elements.view[ _key ]) {
                    return;
                }

                let viewNode = this.elements.view[ _key ]; //타입별 화면
                let fldGrpNodes = viewNode.querySelectorAll(`[${tbFieldGrpType}]`);

                Array.from(fldGrpNodes).forEach(_fldGrpNode  => {
                    let childNode;

                    childNode = _fldGrpNode.firstChild;
                    while(childNode) {
                        if (childNode.nodeType === 1) {                            
                            if (childNode.dataset.tboardFldDel) {
                                childNode = childNode.nextSibling;
                            }
                            else {
                                _fldGrpNode.removeChild(childNode);
                                childNode = _fldGrpNode.firstChild;
                            }                            
                        }
                        else {
                            _fldGrpNode.removeChild(childNode);
                            childNode = _fldGrpNode.firstChild;
                        }
                    }
                });
            });
        }

        initGrpNode(_nodes) {
            if (!_nodes || !(_nodes instanceof Node)) {
                return;
            }
            let childNode = _nodes.firstChild;
            while(childNode) {
                if (childNode.nodeType === 1) {                            
                    if (childNode.dataset.tboardFldDel) {
                        childNode = childNode.nextSibling;
                    }
                    else {
                        _nodes.removeChild(childNode);
                        childNode = _nodes.firstChild;
                    }                            
                }
                else {
                    _nodes.removeChild(childNode);
                    childNode = _nodes.firstChild;
                }
            }
        }

        cloneSrchFld(_viewType, _type) {
            return this.elements[_viewType]["srchFld"][_type].cloneNode(true);
        }

        cloneListHeaderFld(_viewType, _type) {
            return this.elements[_viewType]["tblHeaderFld"][_type].cloneNode(true);
        }

        cloneListColumnFld(_viewType, _type) {
            return this.elements[_viewType]["tblColumnFld"][_type].cloneNode(true);
        }

        getNodeByClass(_el, _value) {

        }
        getNodeById(_el, _value) {

        }
        getNodeByName(_el, _value) {

        }
        getNodeByAttr(_el, _attr, _value) {
            return _el.querySelector(`[${_attr}='${_value}']`);
        }

        getNodeAllByClass(_el, _value) {

        }
        getNodeAllById(_el, _value) {

        }
        getNodeAllByName(_el, _value) {

        }
        getNodeAllByAttr(_el, _attr, _value) {
            return _el.querySelectorAll(`[${_attr}='${_value}']`);
        }

        getAttrValue(_el, _attr) {
            if (!_el) {
                return "";
            }
            return _el.getAttribute(_attr) || "";
        }


        getElement() {

        }

        getTagMap() {
            let tboardTagMap = {
                default : {
                    dataset: {
                        tbId: "data-tboard-id"
                        , tbPageId: "data-tboard-page-id"
                        , tbName: "data-tboard-name"
                        , tbType: "data-tboard-type"
                        , tbArtclNo: "data-tboard-artcl-no"
                        , tbViewType: "data-tboard-view-type"
                        , tbViewSubType: "data-tboard-view-sub-type"
                        , tbFieldType: "data-tboard-fld-type"
                        , tbFieldGrpType: "data-tboard-fld-grp" //tbFieldType 이 붙는 영역
                    }
                    , divInitRoot: "kosha-tboard-root" //화면이 그려지는 곳
                    , root: "tb-root"
                    , view: {
                        searchType1: "search"
                        , searchType2: "search"
                        , searchType3: "search"
                        , detailType1: "detail"
                        , detailType2: "detail"
                        , replyType1: "detail"
                        , writeType1: "write"
                    },
                    searchType1: {                                                
                        srchFld: {
                        },
                        tblHeaderFld: {
                        },
                        tblColumnFld: {
                        }
                        //tboard_search_item
                        //row: "tboard-search-row"
                        //, defaultType1: "tb-src-default-type1"
                        //, defaultType2: "tb-src-default-type2"
                        //, inputType1: "tb-src-input-type1"
                        //, radioType1: "tb-src-radio-type1"
                        //, checkType1: "tb-src-check-type1"
                        //, selectType1: "tb-src-select-type1"
                        //, dateType1: "tb-src-date-type1"
                       // , dateperiodType1: "tb-src-dateperiod-type1"
                    },
                    searchType3: {},
                    searchType2: {},
                    detailType1: {},
                    detailType2: {},
                    writeType1: {}
                }
            };

            return tboardTagMap[ this.type ];
        }
    },
    TboardAuth = class { //화면 권한 객체
        constructor(_instance) {
            this.tboardInstance = _instance;
            this.auth = undefined;
            this.fwkAll = undefined;
            this.idMap = {
                basicAccess : "basic.access"
                , basicDelete : "basic.delete"
                , basicManage : "basic.manage"
                , basicRead : "basic.read"
                , basicWrite : "basic.write"
                , fileDownload : "file.download"
                , fileManage : "file.manage"
                , fileUpload : "file.upload"
                , noticewriteManage : "noticeWrite.manage"
                , noticewriteWrite : "noticeWrite.write"
                , replyDelete : "reply.delete"
                , replyManage : "reply.manage"
                , replyRead : "reply.read"
                , replyWrite : "reply.write"
                , replyAccess: "reply.access"
            };
            this.authNmMap = {
                basicAccess : "게시물 검색"
                , basicDelete : "게시물 삭제"                
                , basicRead : "게시물 상세조회"
                , basicWrite : "게시물 저장"
                , fileDownload : "파일 다운로드"                
                , fileUpload : "파일 업로드"
                , replyAccess: "답글 조회"
                , replyDelete : "답글 삭제"                
                , replyRead : "답글 상세조회"
                , replyWrite : "답글 삭제"                
            };
        }
        
        setAuth(_auth) {
            this.auth = _auth;

            this.fwkAll = _auth;
        }

        getManageAuth( authNm ) {
            let manageKey = `${authNm.split(".")[0]}.manage`;
            if (this.auth[ manageKey ]) {
                return true;
            }
            return false;
        }        

        getAuth( authCd ) {
            //
            if (this.auth[ authCd ]) {
                return true;
            }

            let manageKey = `${authCd.split(".")[0]}.manage`;
            if (this.auth[ manageKey ]) {
                return true;
            }
            return false;
        }

        chkAuth( authKey ) {
            let rtnData = {
                msg: ""
                , isAuth: true
            }
            let authCd = this.idMap[authKey];
            let authNm = this.authNmMap[authKey];            
            if (this.getAuth( authCd ) === false) {
                rtnData.isAuth = false;
                rtnData.msg    = tboardMsg.getMsg("msg_913", [`${authNm}`]);
                tboardUtil.commonAlert(rtnData.msg);
            }
            return rtnData;
        }

        //게시물 본인외 수정 불가(관리자포함)
        isEditLock() {
            if (this.fwkAll.editlock === "Y") {
                return true;
            }
            return false;            
        }

        isShowBtnWrite() {
            return this.isBasicWrite();
        }

        isShowBtnEdit(_wrtrId) {
            //관리권한
            if (this.isBasicManage() && this.isEditLock() === false) {
                return true;
            }
            //일반권한(로그인사용자=글등록자)
            if (this.isBasicWrite() && this.isEqualWriter(_wrtrId)) {
                return true;
            }
            return false;
        }

        isShowBtnDelete(_wrtrId) {
            //관리권한
            if (this.isBasicManage() && this.isEditLock() === false) {
                return true;
            }

            //일반권한(로그인사용자=글등록자)
            if (this.isBasicDelete() && this.isEqualWriter(_wrtrId)) {
                return true;
            }
            return false;
        }


        isShowBtnReplyWrite() {
            return this.isReplyWrite();
        }

        isShowBtnReplyEdit(_wrtrId) {
            //관리권한
            if (this.isReplyManage()) {
                return true;
            }
            //일반권한(로그인사용자=글등록자)
            if (this.isReplyWrite() && this.isEqualWriter(_wrtrId)) {
                return true;
            }
            return false;
        }

        isShowBtnReplyDelete(_wrtrId) {
            //관리권한
            if (this.isBasicManage()) {
                return true;
            }
            //일반권한(로그인사용자=글등록자)
            if (this.isReplyDelete() && this.isEqualWriter(_wrtrId)) {
                return true;
            }
            return false;
        }

        //
        isEqualWriter(_wrtrId) {
            if (!_wrtrId) {
                return false;
            }
            if (_wrtrId === this.tboardInstance.bbsUser.userId) {
                return true;
            }
            return false;            
        }

        isTreeReplyType() {
            if (this.fwkAll.treereply === "Y") {
                return true;
            }
            return false;
        }

        //답글 등록 시 상위 글표시
        isShowUpPst () {
            if (this.fwkAll.showUpPst === "Y") {
                return true;
            }
            return false;
        }

        isFaqType() {
            if (this.fwkAll.boardtype === "type3") {
                return true;
            }
            return false;
        }

        isGalleryType() {
            if (this.fwkAll.boardtype === "type2") {
                return true;
            }
            return false;
        }

        isSecretWrite() {
            if (this.fwkAll.secret === "Y") {
                return true;
            }
            return false;
        }
        
        isNoticeWrite() {
            return this.getAuth(this.idMap.noticewriteWrite);
        }

        isBasicManage() {
            return this.getManageAuth( this.idMap.basicManage );
        }

        isReplyManage() {
            return this.getManageAuth( this.idMap.replyManage );
        }
        
        isNoticeManage() {
            return this.getManageAuth( this.idMap.noticewriteManage );
        }

        isFileManage() {
            return this.getManageAuth( this.idMap.fileManage );
        }

        isBasicAccess() {
            return this.getAuth(this.idMap.basicAccess);
        }
        
        isBasicRead() {
            return this.getAuth(this.idMap.basicRead);
        }

        isBasicDelete() {
            return this.getAuth(this.idMap.basicDelete);
        }

        isBasicWrite() {
            return this.getAuth(this.idMap.basicWrite);
        }

        isReplyAccess() {
            return this.getAuth(this.idMap.replyAccess);
        }
        
        isReplyRead() {
            return this.getAuth(this.idMap.replyRead);
        }

        isReplyDelete() {
            return this.getAuth(this.idMap.replyDelete);
        }

        isReplyWrite() {
            return this.getAuth(this.idMap.replyWrite);
        }

        isFileDownload() {
            return this.getAuth(this.idMap.fileDownload);
        }
        isFileUpload() {
            return this.getAuth(this.idMap.fileUpload);
        }
    },

    TboardDefaultArtcl = class {
        static instance;
        constructor(_tboardType) {
            //값이 있으면 기존값 리턴
            if (TboardDefaultArtcl.instance) {
                return TboardDefaultArtcl.instance;
            }
            this.idMap = {}
            this.init();
        }

        init() {
            //게시물조회 시 데이터의 키값으로 사용할 매핑값
            let defaultArtcl = {
                D010100001: "pstNm" //제목
                , D010200001: "pstCn" //내용
                , D010100003: "wrtrNm" //작성자명
                , D010100004: "wrtrId" //작성자아이디
                , D020100001: "noDesc" //자동역순
                , D020100002: "noAsc" //자동정순
                , D020100004: "inqCnt" //
                , D030100001: "regYmd"
                , D080100001: "atcflYn"
                , D010100009: "pstPswdEcrtvl"
                , D010100010: "srchKywdNm"
                , E050200001: "rlsYn"
                , D060100002: "pstSeCd"
                , D040100001: "replyYn"
                , E080200001: "thumb"
                , D030100002: "mdfcnYmd"
                , D030100003: "frstRegDt"
                , D030100004: "lastMdfcnDt"
            };
            this.idMap = defaultArtcl;
        }

        isThumbArtcl(_artclNo) {
            if (_artclNo === "E080200001"){
                return true;
            }

            return false;
        }

        getDefaultArtcl(_type) {
            let type = _type || "default";
            let arrArtcl = {
                default : 
                    ["D010100001", "D010200001", "D010100003", "D010100004"
                    , "D010100005", "D010100006", "D020100001", "D020100002"
                    , "D020100004", "D030100001", "D030100002", "D030100003"
                    , "D030100004", "D080100001", "D010100009","D010100010"
                    , "D060100002", "E050200001", "D040100001", "E080200001"]
            };
            let useArtcl = arrArtcl[type];
            let artclInfo  = {
                "D010100001": {artclScrnIndctNm : "제목", artclScrnIndctEngNm: ""}
                , "D010200001": {artclScrnIndctNm: '내용', artclScrnIndctEngNm: ""}
                , "D010100003": {artclScrnIndctNm: '작성자', artclScrnIndctEngNm: ""}
                , "D010100004": {artclScrnIndctNm: '작성자ID', artclScrnIndctEngNm: ""}
                , "D010100005": {artclScrnIndctNm: '수정자', artclScrnIndctEngNm: ""}
                , "D010100006": {artclScrnIndctNm: '수정자ID', artclScrnIndctEngNm: ""}
                , "D020100001": {artclScrnIndctNm: 'No', artclScrnIndctEngNm: ""}
                , "D020100002": {artclScrnIndctNm: 'No', artclScrnIndctEngNm: ""}
                , "D020100004": {artclScrnIndctNm: '조회수', artclScrnIndctEngNm: ""}
                , "D030100001": {artclScrnIndctNm: '등록일', artclScrnIndctEngNm: ""}
                , "D030100002": {artclScrnIndctNm: '수정일', artclScrnIndctEngNm: ""}
                , "D030100003": {artclScrnIndctNm: '등록일시', artclScrnIndctEngNm: ""}
                , "D030100004": {artclScrnIndctNm: '수정일시', artclScrnIndctEngNm: ""}
                , "D080100001": {artclScrnIndctNm: '첨부', artclScrnIndctEngNm: ""}
                , "D010100009": {artclScrnIndctNm: '비밀번호', artclScrnIndctEngNm: ""}
                , "D010100010": {artclScrnIndctNm: '키워드', artclScrnIndctEngNm: ""}                
                , "D060100002": {artclScrnIndctNm: '공지', artclScrnIndctEngNm: ""}
                , "E050200001": {artclScrnIndctNm: '공개여부', artclScrnIndctEngNm: ""}
                , "D040100001": {artclScrnIndctNm: '답변상태', artclScrnIndctEngNm: ""}
                , "E080200001": {artclScrnIndctNm: '썸네일', artclScrnIndctEngNm: ""}
            };

            let rtnArtclInfo = {};
            for (const artclNo of useArtcl) {
                if (artclInfo[artclNo]) {
                    artclInfo[artclNo].artclNo = artclNo;
                    artclInfo[artclNo].indctYn = "Y";
                    rtnArtclInfo[artclNo] = JSON.parse(JSON.stringify(artclInfo[artclNo]));
                }
            }

            return rtnArtclInfo;
        }

        getDefaultArtclCtl(_viewType) {
            let rtnData = {};
            let artclInfo  = {                
                //조회조건
                searchType1: {
                    //제목, 내용
                    control: {
                        "D010100001": {
                            "cpt":"defaultType1" //디폴트
                            , "all":"Y" //전체표시
                            , "len":"50"//50자
                        },
                        "D010200001": {
                            "cpt":"defaultType1" //디폴트
                            , "all":"Y" //전체표시
                            , "len":"50"//50자
                        }
                    },
                    sort: {
                        "1": "D010100001"
                        , "2": "D010200001"
                    }
                },
                searchType2: {
                    //제목, 내용
                    control: {
                        "D010100001": {
                            "cpt":"defaultType1" //디폴트
                            , "all":"Y" //전체표시
                            , "len":"50"//50자
                        },
                        "D010200001": {
                            "cpt":"defaultType1" //디폴트
                            , "all":"Y" //전체표시
                            , "len":"50"//50자
                        }
                    },
                    sort: {
                        "1": "D010100001"
                        , "2": "D010200001"
                    }
                },
                searchType3: {
                    //제목, 내용
                    control: {
                        "D010100001": {
                            "cpt":"defaultType1" //디폴트
                            , "all":"Y" //전체표시
                        },
                        "D010200001": {
                            "cpt":"defaultType1" //디폴트
                            , "all":"Y" //전체표시
                        }
                    },
                    sort: {
                        "1": "D010100001"
                        , "2": "D010200001"
                    }
                },
                listType1: {
                    //번호역순(자동), 제목, 첨부, 작성자, 등록일, 조회수
                    //D020100001, D010100001, D080100001, D010100003, D030100001, D020100004
                    control: {
                        "D020100001": {
                            "cpt": "defaultType1"
                            , "width": "100"
                            , "align": "c"
                        },
                        "D010100001": {
                            "cpt": "titleType1"
                            , "width": ""
                            , "align": "n"
                        },
                        "D080100001": {
                            "cpt": "atchType1"
                            , "width": "100"
                            , "align": "c"
                        },
                        "D010100003": {
                            "cpt": "defaultType1"
                            , "width": "150"
                            , "align": "c"
                        },
                        "D030100001": {
                            "cpt":"defaultType1"
                            , "width": "120"
                            , "align": "c"
                        },
                        "D020100004": {
                            "cpt": "defaultType1"
                            , "width": "100"
                            , "align": "c"
                        }
                    },
                    sort: {
                        "1": "D020100001"
                        , "2": "D010100001"
                        , "3": "D080100001"
                        , "4": "D010100003"
                        , "5": "D030100001"
                        , "6": "D020100004"
                    }
                },
                listType2: {
                    //썸네일, 제목, 첨부, 등록일, 조회수
                    //E080200001, D010100001, D080100001, D030100001, D020100004
                    control: {
                        "E080200001": {
                            "cpt": "thumbType1" //썸네일고정위치
                        },
                        "D010100001": {
                            "cpt": "titleType1"  //제목고정위치
                        },
                        "D080100001": {
                            "cpt": "atchType1" //첨부아이콘
                        },
                        "D030100001": {
                            "cpt":"defaultType1" //값
                        },
                        "D020100004": {
                            "cpt": "defaultType2" //표시명:값
                        }
                    },
                    sort: {
                        "1": "E080200001"
                        , "2": "D010100001"
                        , "3": "D080100001"
                        , "4": "D030100001"
                        , "5": "D020100004"
                    }
                },
                listType3: {
                    //제목, 내용
                    //D010100001, D010200001
                    control: {
                        "D010100001": {
                            "cpt": "defaultType1"
                        },
                        "D010200001": {
                            "cpt": "defaultType1"                            
                        }
                    },
                    sort: {
                        "1": "D010100001"
                        , "2": "D010200001"
                    }
                },
                detailType1: {
                    //제목, 작성자, 작성일, 조회수, 내용, 첨부
                    //D010100001, D010100003, D030100001, D020100004, D010200001, D080100001
                    control: {
                        "D010100001": {
                            "cpt":"" //고정위치
                        },
                        "D010100003": {
                            "cpt":"defaultType1" //값
                        },
                        "D030100001": {
                            "cpt":"defaultType1" //값
                        },
                        "D020100004": {
                            "cpt":"defaultType2" //타이틀:값
                        },
                        "D010200001": {
                            "cpt":"" //고정위치
                        },
                        "D080100001": { //기본첨부는 고정위치
                            "cpt":"atchType1" //첨부
                        }
                    },
                    sort: {
                        "1": "D010100001"
                        , "2": "D010100003"
                        , "3": "D030100001"
                        , "4": "D020100004"
                        , "5": "D010200001"
                        , "6": "D080100001"
                    }
                },
                detailType2: {
                    //제목, 작성자, 작성일, 조회수, 썸네일, 내용, 첨부
                    //D010100001, D010100003, D030100001, D020100004, E080200001, D010200001, D080100001
                    control: {
                        "D010100001": {
                            "cpt":"titleType1" //고정위치
                        },
                        "D010100003": {
                            "cpt":"defaultType1" //값
                        },
                        "D030100001": {
                            "cpt":"defaultType1" //값
                        },
                        "D020100004": {
                            "cpt":"defaultType2" //타이틀:값
                        },
                        "E080200001": {
                            "cpt":"thumbType1" //타이틀:값
                        },
                        "D010200001": {
                            "cpt":"editType" //고정위치
                        },
                        "D080100001": { //기본첨부는 고정위치
                            "cpt":"atchType1" //첨부
                        }
                    },
                    sort: {
                        "1": "D010100001"
                        , "2": "D010100003"
                        , "3": "D030100001"
                        , "4": "D020100004"
                        , "5": "E080200001"
                        , "6": "D010200001"
                        , "7": "D080100001"
                    }
                },
                replyType1: {
                    //제목, 작성자, 작성일, 내용, 첨부
                    //D010100001, D010100003, D030100001, D010200001, D080100001
                    control: {
                        "D010100001": {
                            "cpt":"defaultType1" //값
                        },
                        "D010100003": {
                            "cpt":"defaultType1" //값
                        },
                        "D030100003": {
                            "cpt":"defaultType1" //값
                            , "mask": "yyyy-mm-dd hh24:mi"
                        },
                        "D010200001": {
                            "cpt":"" //고정위치
                        },
                        "D080100001": { //기본첨부는 고정위치
                            "cpt":"atchType1" //첨부
                        }
                    },
                    sort: {
                        "1": "D010100001"
                        , "2": "D010100003"
                        , "3": "D030100003"
                        , "4": "D010200001"
                        , "5": "D080100001"
                    }
                },
                writeType1: {
                    //제목, 내용, 첨부
                    //D010100001, D010200001, D080100001
                    control: {
                        "D010100001": { //제목
                            "cpt": "inputType1" //값
                            , "req": "Y"
                            , "len": "100"
                        },
                        "D010200001": { //내용
                            "cpt": "editType1" //값
                            , "req": "Y"
                        },
                        "D080100001": { //첨부
                            "cpt": "atchType1" //타이틀:값
                        }
                    },
                    sort: {
                        "1": "D010100001" //제목
                        , "2": "D010200001" //내용
                        , "3": "D080100001" //첨부                        
                    }
                },
                writeReplyType1: {
                    //제목, 내용, 첨부, 작성자, 작성일시
                    //D010100001, D010200001, D080100001, D010100003, D030100003
                    control: {
                        "D010100001": { //제목
                            "cpt": "inputType1" //값
                            , "req": "Y"
                            , "len": "100"
                            , "width":"100"
                        },
                        "D010200001": { //내용
                            "cpt": "editType1" //값
                            , "req": "Y"
                            , "width": ""
                        },
                        "D080100001": { //첨부
                            "cpt": "atchType1" //
                            , "config":{"maxSize":"10485760","maxCnt":"5","ext":"pdf|hwp|ppt|pptx|xls|xlsx"}
                        },
                        "D010100003": { //작성자
                            "cpt": "inputType1" //
                            , "viewonly": "Y"
                            , "width": "50"
                        },
                        "D030100003": { //작성일시
                            "cpt": "inputType1" //
                            ,"mask":"yyyy-mm-dd hh24:mi"
                            ,"viewonly":"Y"
                            ,"width":"50"
                        }
                    },
                    sort: {
                        "1": "D010100003" //작성자
                        , "2": "D030100003" //작성일시
                        , "3": "D010100001" //제목
                        , "4": "D010200001" //내용
                        , "5": "D080100001" //첨부                     
                    }
                },
                writeDetailType1: {
                    //작성자, 작성일시, 제목, 내용
                    //D010100003, D030100003, D010100001, D010200001
                    control: {
                        "D010100003": {
                            "cpt":"defaultType1" //값
                        },                        
                        "D030100003": {
                            "cpt":"defaultType1" //값
                            , "mask" : "yyyy-mm-dd hh24:mi"
                        },
                        "D010100001": {
                            "cpt":"" //고정위치
                        },
                        "D010200001": {
                            "cpt":"" //고정위치
                        }
                    },
                    sort: {
                        "1": "D010100003"
                        , "2": "D030100003"
                        , "98": "D010100001"
                        , "99": "D010200001"
                    }
                }
            };

            //화면 타입별 기본항목
            Object.keys(_viewType).forEach( _key => {
                let objKey = _viewType[_key];

                if (objKey === "searchType1") {
                    rtnData["list"] = artclInfo[ "listType1" ];
                }
                else if (objKey === "searchType2") {
                    rtnData["list"] = artclInfo[ "listType2" ];
                }
                else if (objKey === "searchType3") {
                    rtnData["list"] = artclInfo[ "listType3" ];
                }

                rtnData[_key] = artclInfo[ objKey ];
            });

            return rtnData;
        }

        get(_artclNo) {
            return this.idMap[_artclNo] || "";
        }

        getArtclOptInfo(_type) {
            let info = this.getDefaultArtcl();
            let artclNo = "";
            if (_type === "notice") { //공지
                artclNo = "D060100002";
            }
            else if (_type === "secret") { //공개여부
                artclNo = "E050200001";
            }            
            else if (_type === "password") { //비밀번호
                artclNo = "D010100009";
            }
            else if (_type === "keyword") { //키워드
                artclNo = "D010100010";
            }
            else if (_type === "thumb") { //썸네일
                artclNo = "E080200001";
            }
            return info[artclNo];
        }

        getArtclOptType(_artclNo) {
            //let info = this.getDefaultArtcl();
            let artclNo = _artclNo || "";
            let type = "";
            if (artclNo === "D060100002") { //공지
                type = "notice";
            }
            else if (artclNo === "E050200001") { //공개여부
                type = "secret";
            }            
            else if (artclNo === "D010100009") { //비밀번호
                type = "password";
            }
            else if (artclNo === "D010100010") { //키워드
                type = "keyword";                
            }
            return type;
        }
        
        isAtchArtcl(_artclNo) {
            if ((_artclNo.indexOf("D08") > -1) || (_artclNo.indexOf("E08") > -1)) {
                return true;
            }
            return false;
        }

        getArtclSe(_artclNo) {
            return _artclNo.substring(0, 1);
        }

        getArtclType(_artclNo) {
            return _artclNo.substring(1, 3);
        }
        
        getArtclSubType(_artclNo) {
            return _artclNo.substring(3, 5);
        }

        //항목번호에 따른 마스크적용
        applyMaskByArtclNo(_artclNo, _value, _mask) {
            /**
             * 01: 텍스트
             * 02: 숫자
             * 03: 날짜
             * 05: 라디오
             * 06: 체크 
             * 08: 파일
             * 09: 팝업
             */
            try {
                let artclSe = this.getArtclSe(_artclNo); //일반,확장
                let artclType = this.getArtclType(_artclNo); //
                let artclSubType = this.getArtclSubType(_artclNo);

                let value = _value;
                if (artclType == "02") {
                    value = tboardUtil.convertNumber(value);
                }
                else if (artclType == "03") {
                    if (_mask) {
                        value = tboardUtil.dateFormatMask(value, _mask);
                    }
                    else if (artclSubType === "01") {
                        value = tboardUtil.dateFormat(value);
                    }
                    else if (artclSubType === "02") {
                        value = tboardUtil.dateFormat(value.substring(1,6));
                    }
                }

                return value;
            }
            catch(error) {
                return _value;
            }
        }

        //입력 마스크적용
        applyInputMask(_value, _mask) {
            try {
                if (!_mask) {
                    return _value;
                }

                if (_mask === "hp") {
                    return tboardUtil.formatPhoneNumber(_value);
                }
            }
            catch(error) {
                return _value;
            }
        }

    },

    TboardArtcl = class { //화면 컴포넌트
        constructor(_tboardInstance) {
            this.tboardInstance = _tboardInstance;
            this.comCodeMng = this.tboardInstance.bbsComGrpCd;

            //가장기본이 되는 값
            this.user = {
                info: undefined //항목정보
                , ctl: undefined //제어정보
                , auth: undefined //권한항목
            };

            //가장기본이 되는 값
            this.default = {
                info: undefined   //항목정보
                , ctl: undefined  //제어정보 
            };
            
            //this.bbsDefault = undefined;

            //controll, sort 정보
            this.search = undefined;
            this.list   = undefined;
            this.detail = undefined;
            this.write  = undefined;
            this.writeReply  = undefined;

            //component
            this.cmp = undefined;
            
            //component와 항목 매핑(default타입은 복수)
            this.idMap = {
                search: {}
            };
        }

        getArtclNm(_artclNo) {
            //영문/한글
            //this.tboardInstance.bbsFwkAll[optionKey] //미정의
            let isKr = true;

            return isKr ? this.user.info[_artclNo].artclScrnIndctNm : this.user.info[_artclNo].artclScrnIndctEngNm;
        }

        getIndctYn(_artclNo) {
            return this.user.info[_artclNo].indctYn;
        }

        //항목 설정 정보 세팅
        setBbsArtcl(_object) {
            //DB에 설정된 항목
            let bbsArtclList = _object.artclDefaultGrid || [];
            //DB조회결과 항목
            this.user.ctl   = _object.bbsArtclAll || {};
            this.user.auth  = _object.bbsArtclUser || {};
            let viewType    = this.tboardInstance.viewType;

            //사용항목은 필수
            this.user.info  = {}; //초기화
            bbsArtclList.forEach( _obj => {
                let artclNo = _obj.artclNo;
                this.user.info[artclNo] = _obj || {};
            });

            //가장 기본 항목
            this.default.info = this.tboardInstance.bbsDfArtcl.getDefaultArtcl();
            this.default.ctl =  this.tboardInstance.bbsDfArtcl.getDefaultArtclCtl(viewType);
            
            //DB 설정값이 없으면 기본값
            if (Object.keys(this.user.info).length < 1) {
                this.user.info = JSON.parse(JSON.stringify(this.default.info));
            }

            //search, list, detail, write
            Object.keys(this.default.ctl).forEach( _key => {
                /******************************************
                 * DB조회결과 설정값이 없으면 디폴트 설정으로 세팅 
                 *******************************************/
                if (Object.keys(this.user.ctl[_key].sort || {}).length > 0) {
                    return;
                }
                
                //search, list, detail, write 초기화(없으면 기본값으로 생성)
                this.user.ctl[_key]         = this.user.ctl[_key] || {};
                this.user.ctl[_key].sort    = this.user.ctl[_key].sort || {};//sort 등록
                this.user.ctl[_key].control = this.user.ctl[_key].control || {};//control 등록

                //기본값이 없으면 패스
                if (!this.default.ctl[ _key ]) {
                    return;
                }

                //sort 객체 생성
                let objSort = this.default.ctl[ _key ].sort;
                Object.keys( objSort ).forEach( _sortKey => {
                    let artclNo = objSort[ _sortKey ];
                    
                    //사용자가 사용하는 항목에 있으면
                    if (this.user.info.hasOwnProperty(artclNo)) {
                        this.user.ctl[_key].sort[_sortKey] = objSort[ _sortKey ] || {};
                    }
                });

                //control 객체 생성
                let objCtl = this.default.ctl[ _key ].control;
                Object.keys( objCtl ).forEach( _ctlKey => {
                    let artclNo =  _ctlKey;
                    
                    //사용자가 사용하는 항목에 있으면
                    if (this.user.info.hasOwnProperty(artclNo)) {
                        this.user.ctl[_key].control[_ctlKey] = objCtl[ _ctlKey ] || {};
                    }
                });
            });
        }

        addArtclInfo(_info) {
            if (typeof _info !== "object") {
                return;
            }
            if (!_info.artclNo) {
                return;
            }
            _info.artclScrnIndctEngNm = _info.artclScrnIndctEngNm || "";
            _info.artclScrnIndctNm    = _info.artclScrnIndctNm || "";
            _info.artclNo = _info.artclNo || "";
            _info.indctYn = _info.indctYn || "Y";
            
            let addInfo = {};
            addInfo[_info.artclNo] = _info;
            this.user.info = {...this.user.info, ...addInfo};
        }

        createBbsComponent() {
            //searchType1, searhType2, detailType1, detailType2, write
            Object.keys(this.tboardInstance.viewType).forEach( _key => {
                //console.log( " =====================> createBbsComponent ", _key);
                let fnName = this.tboardInstance.viewType[_key];
                if (typeof this[ fnName ] === "function") {
                    //console.log( "       =============> fnName ", fnName);
                    this[ fnName ]( fnName );
                }
            });
        }

        //조회조건
        searchCndType1(_viewType) {
            let type    = "search";
            this.idMap  = this.idMap || {}; //초기화
            this.idMap[ type ] = this.idMap[ type ] || {}; //초기화
            
            //컴포넌트 초기화
            this.cmp = this.cmp || {};
            this.cmp[ type ] = this.cmp[ type ] || {};

            //조회조건 컴포넌트 생성/등록
            this.search = JSON.parse(JSON.stringify(this.user.ctl.search));//제어정보
            //컴포넌트 객체 생성
            Object.keys(this.search.sort).forEach(_key => {
                let artclNo = this.search.sort[ _key ];            //항목번호
                let artclCtlInfo = this.search.control[ artclNo ]; //항목별 제어 정보
                
                //컴포넌트 key
                let cmpKey = artclNo
                if (artclCtlInfo.cpt === "defaultType1") {
                    cmpKey = artclCtlInfo.cpt;
                }

                //항목, 컴포넌트 아이디 연결
                this.idMap[type][artclNo] = cmpKey;

                artclCtlInfo.cmpKey   = cmpKey;
                artclCtlInfo.artclNo  = artclNo;
                artclCtlInfo.viewType = _viewType; //searchType1, searchType2

                //this.cmp.search
                this.cmp[type][cmpKey] = new this.SearchCndComponent(this, artclCtlInfo);
            });
        }


        //searchType1의 동적 항목 생성
        searchType1( _viewType ) {
            //조회조건 생성(searchType1, searchType2, searchType3 / 일반,갤러리,faq)  동일
            this.searchCndType1(_viewType);

            //리스트영역 컴포넌트(화면 타입별로 생성 부분)
            let type = "list"; //this.cmp.list로 생성
            
            this.idMap  = this.idMap || {}; //초기화
            this.idMap[ type ] = this.idMap[ type ] || {}; //초기화
            
            //컴포넌트 초기화
            this.cmp = this.cmp || {};
            this.cmp[ type ] = this.cmp[ type ] || {};

            //목록 컴포넌트 생성/등록
            this.list = JSON.parse(JSON.stringify(this.user.ctl.list));//제어정보

            //컴포넌트 객체 생성
            this.cmp[ type ]["header"] = new this.HeaderComponent(this);
            this.cmp[ type ]["column"] = new this.ColumnComponent(this);
            Object.keys(this.list.sort).forEach(_key => {
                let artclNo = this.list.sort[ _key ];            //항목번호
                let artclCtlInfo = this.list.control[ artclNo ]; //항목별 제어 정보                
                
                //컴포넌트 key
                let cmpKey = artclNo;

                //항목, 컴포넌트 아이디 연결
                this.idMap[type][artclNo] = cmpKey;

                artclCtlInfo.cmpKey   = cmpKey;
                artclCtlInfo.artclNo  = artclNo;
                artclCtlInfo.viewType = _viewType; //searchType1, searchType2

                //this.cmp.list
                //this.cmp[ type ][cmpKey] = new this.ListComponent(this, artclCtlInfo);
                
                this.cmp[ type ]["header"].append( artclCtlInfo );
                this.cmp[ type ]["column"].append( artclCtlInfo );
            });
        }

        searchType2(_viewType) {
            //조회조건 생성(searchType1, searchType2, searchType3 / 일반,갤러리,faq)  동일
            this.searchCndType1(_viewType);

            //리스트영역 컴포넌트(화면 타입별로 생성 부분)
            let type = "list"; //this.cmp.list로 생성
            
            //컴포넌트 초기화
            this.cmp = this.cmp || {};
            this.cmp[ type ] = this.cmp[ type ] || {};

            //목록 컴포넌트 생성/등록
            this.list = JSON.parse(JSON.stringify(this.user.ctl.list));//제어정보

            //컴포넌트 객체 생성
            this.cmp[ type ]["item"] = new this.ListType2Component(this);            

            Object.keys(this.list.sort).forEach(_key => {
                let artclNo      = this.list.sort[ _key ];       //항목번호
                let artclCtlInfo = this.list.control[ artclNo ]; //항목별 제어 정보
                artclCtlInfo.artclNo = artclNo;

                //생성 객체에 설정정보 추가
                this.cmp[ type ]["item"].append( artclCtlInfo );
            });
        }

        searchType3(_viewType) {
            //조회조건 생성(searchType1, searchType2, searchType3 / 일반,갤러리,faq)  동일
            this.searchCndType1(_viewType);

            //리스트영역 컴포넌트(화면 타입별로 생성 부분)
            let type = "list"; //this.cmp.list로 생성

            //this.idMap  = this.idMap || {}; //초기화
            //this.idMap[ type ] = this.idMap[ type ] || {}; //초기화
            
            //컴포넌트 초기화
            this.cmp = this.cmp || {};
            this.cmp[ type ] = this.cmp[ type ] || {};
            
            //목록 컴포넌트 생성/등록
            this.list = JSON.parse(JSON.stringify(this.user.ctl.list));//제어정보

            //컴포넌트 객체 생성
            this.cmp[ type ]["defaulType1"] = new this.ListType3component(this);
        }

        detailType1(_viewType) {
            //console.log(" =====================> detailType1", _viewType);

            //컴포넌트 타입
            let type    = "detail";

            //항목번호가 어떤 컴포넌트 로 매핑되는지 => 조회조건 다건매핑 때문에 넣음
            this.idMap  = this.idMap || {}; //초기화
            this.idMap[ type ] = this.idMap[ type ] || {};
            
            //컴포넌트 초기화
            this.cmp = this.cmp || {};
            this.cmp[ type ] = this.cmp[ type ] || {};
            this.cmp[ type ].artcl = this.cmp[ type ].artcl || {};
            this.cmp[ type ].etc   = this.cmp[ type ].ect || {};

            //상세화면 컴포넌트 생성/등록
            this.detail = JSON.parse(JSON.stringify(this.user.ctl.detail));//제어정보
            //컴포넌트 객체 생성
            Object.keys(this.detail.sort).forEach(_key => {
                let artclNo = this.detail.sort[ _key ];            //항목번호
                let artclCtlInfo = this.detail.control[ artclNo ]; //항목별 제어 정보
                
                let cmpKey = artclNo;

                //항목, 컴포넌트 아이디 연결
                this.idMap[type][artclNo] = cmpKey;

                artclCtlInfo.cmpKey   = cmpKey;
                artclCtlInfo.artclNo  = artclNo;
                artclCtlInfo.viewType = _viewType; //searchType1, searchType2

                //this.cmp.search
                this.cmp[type][cmpKey] = new this.DetailType1Component(this, artclCtlInfo);

                this.cmp[ type ]["artcl"][cmpKey] = this.cmp[type][cmpKey];
            });
            //
        }

        detailType2(_viewType) {
            //console.log(" =====================> detailType2", _viewType);
            //컴포넌트 타입
            let type    = "detail";

            //컴포넌트 초기화
            this.cmp = this.cmp || {};
            this.cmp[ type ] = this.cmp[ type ] || {};
            this.cmp[ type ].artcl = this.cmp[ type ].artcl || {};
            this.cmp[ type ].etc   = this.cmp[ type ].ect || {};
            
            //상세화면 컴포넌트 생성/등록
            this.detail = JSON.parse(JSON.stringify(this.user.ctl.detail));//제어정보

            //컴포넌트 객체 생성
            this.cmp[type]["view"] = new this.DetailType2Component(this);
            Object.keys(this.detail.sort).forEach(_key => {

                let artclNo      = this.detail.sort[ _key ];       //항목번호
                let artclCtlInfo = this.detail.control[ artclNo ]; //항목별 제어 정보
                artclCtlInfo.artclNo = artclNo;

                //생성 객체에 설정정보 추가
                this.cmp[ type ]["view"].append( artclCtlInfo );
            });
        }

        replyType1(_viewType) {
            //console.log(" =====================> detailType1", _viewType);

            //컴포넌트 타입
            let type    = "reply";

            //항목번호가 어떤 컴포넌트 로 매핑되는지 => 조회조건 다건매핑 때문에 넣음
            this.idMap  = this.idMap || {}; //초기화
            this.idMap[ type ] = this.idMap[ type ] || {};
            
            //컴포넌트 초기화
            this.cmp = this.cmp || {};
            this.cmp[ type ] = this.cmp[ type ] || {};
            this.cmp[ type ].artcl = this.cmp[ type ].artcl || {};
            this.cmp[ type ].etc   = this.cmp[ type ].ect || {};

            //상세화면 컴포넌트 생성/등록
            this.reply = JSON.parse(JSON.stringify(this.user.ctl.reply));//제어정보
            //컴포넌트 객체 생성
            Object.keys(this.reply.sort).forEach(_key => {
                let artclNo = this.reply.sort[ _key ];            //항목번호
                let artclCtlInfo = this.reply.control[ artclNo ]; //항목별 제어 정보
                
                let cmpKey = artclNo;

                //항목, 컴포넌트 아이디 연결
                this.idMap[type][artclNo] = cmpKey;

                artclCtlInfo.cmpKey   = cmpKey;
                artclCtlInfo.artclNo  = artclNo;
                artclCtlInfo.viewType = _viewType; //searchType1, searchType2

                //this.cmp.search
                this.cmp[type][cmpKey] = new this.DetailType1Component(this, artclCtlInfo);

                this.cmp[ type ]["artcl"][cmpKey] = this.cmp[type][cmpKey];
            });

            //
        }

        writeType1(_viewType) {
            //화면 생성
            let type    = "write";

            //항목번호가 어떤 컴포넌트 로 매핑되는지 => 조회조건 다건매핑 때문에 넣음
            this.idMap  = this.idMap || {}; //초기화
            this.idMap.write = this.idMap.write || {};
            
            //컴포넌트 초기화
            this.cmp = this.cmp || {};
            this.cmp.write = this.cmp.write || {};
            this.cmp.write.artcl = this.cmp.write.artcl || {};
        

            //조회조건 컴포넌트 생성/등록
            this.write = JSON.parse(JSON.stringify(this.user.ctl.write));//제어정보
            //컴포넌트 객체 생성
            Object.keys(this.write.sort).forEach(_key => {
                let artclNo      = this.write.sort[ _key ];       //항목번호
                let artclCtlInfo = this.write.control[ artclNo ]; //항목별 제어 정보
                
                //설정값
                artclCtlInfo.artclNo = artclNo;
                artclCtlInfo.optType = this.tboardInstance.bbsDfArtcl.get(artclNo);

                if (artclCtlInfo.optType === "pstSeCd") {
                    if (this.tboardInstance.bbsAuth.isNoticeWrite() === false) {
                        return;
                    }                    
                }
                else if (artclCtlInfo.optType === "rlsYn") {
                    if (this.tboardInstance.bbsAuth.isSecretWrite() === false) {
                        return;
                    }                    
                }
                //TODO
                this.cmp.write.artcl[artclNo] = new this.WriteComponent(this, artclCtlInfo);
            });

            //공지여부
            if (this.tboardInstance.bbsAuth.isNoticeWrite()) {
                let artclInfo = this.tboardInstance.bbsDfArtcl.getArtclOptInfo("notice");

                //공지
                if (!this.cmp.write.artcl[ artclInfo.artclNo ]) {
                    let ctlInfo = {
                        artclNo: artclInfo.artclNo
                        , optType: this.tboardInstance.bbsDfArtcl.get(artclInfo.artclNo)
                    };
                    
                    //항목정보 추가
                    this.addArtclInfo(artclInfo);
                    this.user.ctl.write.sort[0] = artclInfo.artclNo;
                    this.user.ctl.write.control[artclInfo.artclNo] = {};

                    this.cmp.write.artcl[ artclInfo.artclNo ] = new this.WriteComponent(this, ctlInfo);
                }
            }

            //비밀글여부
            if (this.tboardInstance.bbsAuth.isSecretWrite()) {
                let artclInfo = this.tboardInstance.bbsDfArtcl.getArtclOptInfo("secret");
                if (this.user.info[ artclInfo.artclNo ]) {
                    artclInfo = this.user.info[ artclInfo.artclNo ];
                }

                let objConfig  = this.user.ctl.write;
                let cmpSortSeq = Object.keys(objConfig.sort).sort((a, b) => Number(a) - Number(b));
                let lastIndex  = cmpSortSeq.pop();
                lastIndex = isNaN(lastIndex) ? 99 : Number(lastIndex) + 1;
                
                //비밀글여부
                if (!this.cmp.write.artcl[ artclInfo.artclNo ]) {
                    let ctlInfo = {
                        artclNo: artclInfo.artclNo
                        , optType: this.tboardInstance.bbsDfArtcl.get(artclInfo.artclNo)
                    };

                    //항목정보 추가
                    this.addArtclInfo(artclInfo);
                    this.user.ctl.write.sort[ lastIndex ] = artclInfo.artclNo;
                    this.user.ctl.write.control[artclInfo.artclNo] = {};

                    this.cmp.write.artcl[ artclInfo.artclNo ] = new this.WriteComponent(this, ctlInfo);
                }                
            }

            //게시판유형(갤러리)
            if (this.tboardInstance.bbsAuth.isGalleryType()) {
                let artclInfo = this.tboardInstance.bbsDfArtcl.getArtclOptInfo("thumb");
                let objConfig  = this.user.ctl.write;
                let cmpSortSeq = Object.keys(objConfig.sort).sort((a, b) => Number(a) - Number(b));
                let lastIndex  = cmpSortSeq.pop();
                lastIndex = isNaN(lastIndex) ? 99 : Number(lastIndex) + 1;
                //이미 포함되어 있으면 SKIP, 없으면 추가
                if (!this.cmp.write.artcl[ artclInfo.artclNo ]) {
                    let ctlInfo = {
                        artclNo: artclInfo.artclNo
                        , optType: this.tboardInstance.bbsDfArtcl.get(artclInfo.artclNo)
                    };

                    //항목정보 추가
                    this.addArtclInfo(artclInfo);
                    this.user.ctl.write.sort[lastIndex] = artclInfo.artclNo;
                    this.user.ctl.write.control[artclInfo.artclNo] = {};

                    this.cmp.write.artcl[ artclInfo.artclNo ] = new this.WriteComponent(this, ctlInfo);
                }                
            }
        }


        writeReplyType1(_viewType) {
            //화면 생성
            let type    = "writeReply";

            //컴포넌트 초기화
            this.cmp = this.cmp || {};
            this.cmp.writeReply = this.cmp.writeReply || {};
            this.cmp.writeReply.artcl = this.cmp.writeReply.artcl || {};

            //조회조건 컴포넌트 생성/등록
            this.writeReply = JSON.parse(JSON.stringify(this.user.ctl.writeReply));//제어정보

            let objConfig  = this.user.ctl.writeReply;
            let cmpSortSeq = Object.keys(objConfig.sort).sort((a, b) => Number(a) - Number(b));
            cmpSortSeq.forEach( _key => {
                let artclNo      = objConfig.sort[_key];
                let artclCtlInfo = objConfig.control[ artclNo ]; //항목별 제어 정보
                
                //설정값
                artclCtlInfo.artclNo = artclNo;
                artclCtlInfo.optType = this.tboardInstance.bbsDfArtcl.get(artclNo);

                this.cmp.writeReply.artcl[artclNo] = new this.WriteComponent(this, artclCtlInfo);                
            });


            //비밀글여부
            if (this.tboardInstance.bbsAuth.isSecretWrite()) {
                let artclInfo = this.tboardInstance.bbsDfArtcl.getArtclOptInfo("secret");
                if (this.user.info[ artclInfo.artclNo ]) {
                    artclInfo = this.user.info[ artclInfo.artclNo ];
                }

                let objConfig  = this.user.ctl.writeReply;
                let cmpSortSeq = Object.keys(objConfig.sort).sort((a, b) => Number(a) - Number(b));
                let lastIndex  = cmpSortSeq.pop();
                lastIndex = isNaN(lastIndex) ? 99 : Number(lastIndex) + 1;
                
                //비밀글여부
                if (!this.cmp.writeReply.artcl[ artclInfo.artclNo ]) {
                    let ctlInfo = {
                        artclNo: artclInfo.artclNo
                        , optType: this.tboardInstance.bbsDfArtcl.get(artclInfo.artclNo)
                    };

                    //항목정보 추가
                    this.addArtclInfo(artclInfo);
                    this.user.ctl.writeReply.sort[ lastIndex ] = artclInfo.artclNo;
                    this.user.ctl.writeReply.control[artclInfo.artclNo] = {};

                    this.cmp.writeReply.artcl[ artclInfo.artclNo ] = new this.WriteComponent(this, ctlInfo);
                }         
            }
        }

        ListType2Component = class {
            constructor(_instance) {
                this.tboardArtcl = _instance;
                this.elMng       = tboardMng.elementsInstance;
                this.comCodeMng  = this.tboardArtcl.tboardInstance.bbsComGrpCd;

                this.node        = undefined;

                this.baseFormEl   = {};
                this.formEl       = {};
                this.artclCtlInfo = {};

                this.init();
            }

            init() {
                //기본 아이템 구성
                this.baseFormEl.root = tboardMng.elements.searchType2.galleryItemFld.root.cloneNode(true);

                this.baseFormEl.thumbType1 = tboardMng.elements.searchType2.galleryItemFld.thumbType1.cloneNode(true);
                this.baseFormEl.titleType1 = tboardMng.elements.searchType2.galleryItemFld.titleType1.cloneNode(true);
                this.baseFormEl.info = tboardMng.elements.searchType2.galleryItemFld.info.cloneNode(true);

                this.baseFormEl.root.append(this.baseFormEl.thumbType1);
                this.baseFormEl.root.append(this.baseFormEl.titleType1);
                this.baseFormEl.root.append(this.baseFormEl.info);

                this.baseFormEl.root.querySelectorAll("a").forEach(_el => _el.href = "javascript:void(0);");
            }


            append(_ctlInfo) {
                if (!_ctlInfo || !_ctlInfo.artclNo) return;
                this.artclCtlInfo[_ctlInfo.artclNo] = _ctlInfo;
                let componentType = _ctlInfo.cpt || "";

                if (tboardMng.elements.searchType2.galleryItemFld.hasOwnProperty(componentType)) {
                    if (this.baseFormEl.hasOwnProperty(componentType)) {
                        this.baseFormEl[componentType].dataset.tboardArtclNo = _ctlInfo.artclNo;
                    }
                    if (componentType === "titleType1") {
                        this.baseFormEl[componentType].textContent = "";
                    }
                }
                else if (tboardMng.elements.searchType2.galleryInfoFld.hasOwnProperty(componentType)) {
                    this.baseFormEl[_ctlInfo.artclNo] = tboardMng.elements.searchType2.galleryInfoFld[componentType].cloneNode(true);
                    
                    this.baseFormEl[_ctlInfo.artclNo].dataset.tboardArtclNo = _ctlInfo.artclNo;
                    this.baseFormEl.info.append(this.baseFormEl[_ctlInfo.artclNo]);

                    if (componentType === "defaultType1" || componentType === "defaultType2") {
                        this.baseFormEl[_ctlInfo.artclNo].textContent = "";
                    }
                }
            }

            //기본값 복사
            cloneFormEl() {
                Object.keys(this.baseFormEl).forEach( _key => {
                    this.formEl[_key] = this.baseFormEl[_key].cloneNode(true);
                });
            }
            
            getFormEl(_artclNo) {
                return this.formEl.root.querySelector(`[data-tboard-artcl-no=${_artclNo}]`);
            }

            getItemEl(_pstInfo, _thumbInfo, _artclInfo) {
                //기본 gallery item el 생성
                //this.cloneFormEl();
                this.formEl.root = this.baseFormEl.root.cloneNode(true);

                //데이터
                let pstInfo   = _pstInfo || {};
                let thumbInfo = _thumbInfo || [];
                let artclInfo = _artclInfo || [];

                //값 설정
                Object.keys(this.artclCtlInfo).forEach( _key => {
                    let ctlInfo    = this.artclCtlInfo[_key];
                    let artclNo    = ctlInfo.artclNo;
                    let artclNm    = this.tboardArtcl.tboardInstance.bbsArtcl.getArtclNm(artclNo);
                    let artclDbNm  = this.tboardArtcl.tboardInstance.bbsDfArtcl.get(artclNo);
                    let artclValue = "";
                    let value      = "";

                    let dataKey = `${pstInfo.pstNo}${artclNo}`;
                    if (artclInfo[dataKey]) {
                        artclValue = artclInfo[dataKey].lcpctyArtclInptYn === "Y" ? artclInfo[dataKey].artclLcpctyInptCn : artclInfo[dataKey].artclInptCn;
                    }
                    value = (artclDbNm) ? pstInfo[artclDbNm] || "" : artclValue || "";

                    //
                    if (this.tboardArtcl.tboardInstance.bbsDfArtcl.isThumbArtcl(artclNo)) {                        
                        this.setThumb(artclNo, thumbInfo, pstInfo);
                    }
                    else {
                        let input = {};
                        input.artclNo = artclNo;
                        input.artclNm = artclNm;
                        input.value   = value;
                        input.pstInfo = pstInfo;
                        this.setValue(input);
                    }
                });

                return this.formEl.root;
            }
            
            setThumb(_artclNo, _thumbInfo, _pstInfo) {
                let procEl = this.getFormEl(_artclNo);
                if (!Array.isArray(_thumbInfo) || _thumbInfo.length < 1) {
                    return;
                }
                let imageBase64 = _thumbInfo[0].imageBase64;
                procEl.style.backgroundImage = `url(${imageBase64})`;
                procEl.addEventListener("click", () => {
                    let args = {
                        key: "basicRead.view"
                        , data: _pstInfo || {}
                    };
                    this.tboardArtcl.tboardInstance.bbsEvent.handleEvent(args);
                });
            }

            setTitle(_thumbInfo) {
            }

            setValue(_args) {
                if (!_args.artclNo) {
                    return;
                }
                
                let artclNo = _args.artclNo || "";
                let artclNm = _args.artclNm || "";
                let value   = _args.value || "";
                let pstInfo = _args.pstInfo || {};
                let procEl  = this.getFormEl(artclNo);
                let ctlInfo = this.artclCtlInfo[artclNo] || {};
                let mask    = ctlInfo.mask || "";
                if (Object.keys(ctlInfo).length < 1) {
                    return;
                }
                
                if (ctlInfo.src && ctlInfo.cct) {
                    value = this.bbsComGrpCd.getCodeNm(ctlInfo.cct, ctlInfo.src, value);
                }
                else {
                    //마스크
                    value = this.tboardArtcl.tboardInstance.bbsDfArtcl.applyMaskByArtclNo(artclNo, value, mask);
                }

                if (ctlInfo.cpt === "titleType1") {
                    procEl.textContent = value;
                    procEl.addEventListener("click", () => {
                        let args = {
                            key: "basicRead.view"
                            , data: pstInfo
                        };
                        this.tboardArtcl.tboardInstance.bbsEvent.handleEvent(args);
                    });
                }
                else if (ctlInfo.cpt === "atchType1") {
                    if (value !== "Y") {
                        procEl.style.display  = "none";
                        return;
                    }

                    procEl.style.display  = "block";
                    procEl.addEventListener("click", () => {
                        let fileDown = {
                            pstNo: pstInfo.pstNo
                            , artclNo: artclNo
                            , bbsAtcflNo: "all"
                            , pstNm: pstInfo.pstNm
                            , fileNm: ""
                        };

                        this.tboardArtcl.tboardInstance.bbsEvent.fileDownload(fileDown);
                    });
                }
                else if (ctlInfo.cpt === "defaultType1") {
                    procEl.textContent = `${value}`;
                }
                else if (ctlInfo.cpt === "defaultType2") {
                    procEl.textContent = `${artclNm}: ${value}`;
                }
            }
        }

        ListType3component = class {
            constructor(_instance, _ctlInfo) {
                this.tboardArtcl = _instance;
                this.elMng       = tboardMng.elementsInstance;
                this.node        = undefined;
                this.atchEl      = undefined;
                this.init();
            }

            init() {
                //노드 복사
                this.node   = tboardMng.elements.searchType3.faqFld.defaultType1.cloneNode(true);
            }
        }

        commentComponent = class {
            constructor(_instance, _ctlInfo) {
                
            }

        } 


        commentReplyComponent = class {
            constructor(_instance, _ctlInfo) {

            }

        }


        DetailType1Component = class {
            constructor(_instance, _ctlInfo) {
                this.tboardArtcl = _instance;
                this.viewType    = this.tboardArtcl.tboardInstance.viewType["detail"];
                this.elMng       = tboardMng.elementsInstance;
                
                this.comCodeMng  = this.tboardArtcl.tboardInstance.bbsComGrpCd;

                this.ctlInfo     = _ctlInfo; //제어정보
                this.artclNo     = _ctlInfo.artclNo || "";
                
                this.type        = this.ctlInfo.cpt;
                this.artclInfo   = this.tboardArtcl.user.info[ _ctlInfo.artclNo ]; //항목정보
                this.artclNm     = this.tboardArtcl.getArtclNm( _ctlInfo.artclNo); //항목명
                this.indctYn     = this.tboardArtcl.getIndctYn( _ctlInfo.artclNo); //표시여부

                //초기화
                this.artclNos    = this.artclNos || {};
                this.artclNos[_ctlInfo.artclNo] = ""; //항목번호

                this.node        = undefined;
                this.editor      = undefined;                
                this.labelNode   = undefined; //라벨노드
                this.files       = {};

                this.isDefaultType = false;

                this.init();
            }

            init() {
                //기본항목 중 고정위치에 넣어야 되는 것(제목, 내용)
                let defaultArtclNos = ["D010100001", "D010200001"];
                if (defaultArtclNos.includes(this.artclNo)) {
                    this.isDefaultType = true;
                    this.type = this.tboardArtcl.tboardInstance.bbsDfArtcl.get(this.artclNo);
                }

                //추가 처리함수
                //노드 복사
                let originNode = tboardMng.elements[this.viewType].dtlFld[this.type];
                if (originNode && originNode instanceof HTMLElement) {
                    this.node = originNode.cloneNode(true);
                }

                if (typeof this[ this.type ] === "function") {
                    this[ this.type ]();
                }
            }

            /*setInitValue(_node, _initValue) {

            }*/
        }


        DetailType2Component = class {
            constructor(_instance) {
                this.tboardArtcl = _instance;
                this.elMng       = tboardMng.elementsInstance;
                this.comCodeMng  = this.tboardArtcl.tboardInstance.bbsComGrpCd;

                this.node         = undefined;
                this.baseFormEl   = {};
                this.formEl       = {};
                this.artclCtlInfo = {};
            }

            append(_ctlInfo) {
                if (!_ctlInfo || !_ctlInfo.artclNo) return;
                this.artclCtlInfo[_ctlInfo.artclNo] = _ctlInfo;
            }

            setDetailView(_pstDtlData) {
                let viewEl      = this.tboardArtcl.tboardInstance.view.detail;
                let pstData     = _pstDtlData.pstInfo; //게시물데이터                
                let movePstData = _pstDtlData.movePstInfo; //이전,다음데이터
                let atcflData   = _pstDtlData.atcflInfo; //첨부데이터
                let artclData   = _pstDtlData.artclInfo; //첨부데이터

                //상세화면 항목 순서
                let objConfig  = this.tboardArtcl.tboardInstance.bbsArtcl.user.ctl.detail;
                let cmpSortSeq = Object.keys(objConfig.sort).sort((a, b) => Number(a) - Number(b));
                
                cmpSortSeq.forEach( _key => {
                    let artclNo    = objConfig.sort[_key];
                    let artclNm    = this.tboardArtcl.tboardInstance.bbsArtcl.getArtclNm(artclNo);
                    let artclDbNm  = this.tboardArtcl.tboardInstance.bbsDfArtcl.get(artclNo);
                    let ctlInfo    = this.artclCtlInfo[artclNo];
                    let mask       = ctlInfo.mask;
                    let artclValue = "";
                    let value = "";
                    if (artclData[artclNo]) {
                        artclValue = artclData[artclNo].lcpctyArtclInptYn === "Y" ? artclData[artclNo].artclLcpctyInptCn : artclData[artclNo].artclInptCn;
                    }
                    value = (artclDbNm) ? pstData[artclDbNm] || "" : artclValue || "";
                    if (ctlInfo.src && ctlInfo.cct) {
                        value = this.bbsComGrpCd.getCodeNm(ctlInfo.cct, ctlInfo.src, value);
                    }
                    else {
                        //마스크
                        value = this.tboardArtcl.tboardInstance.bbsDfArtcl.applyMaskByArtclNo(artclNo, value, mask);
                    }
                    
                    //제목, 내용 등
                    if (artclDbNm === "pstNm" || ctlInfo.cpt === "titleType1") {
                        //let contentNode = tboardMng.elements.detailType2.dtlFld.titleType1.cloneNode(true);
                        let contentNode = viewEl.querySelector(`[data-tboard-fld-id="${artclDbNm}"]`);
                        contentNode.textContent = value || "";
                    }
                    else if (ctlInfo.cpt === "editType1") {
                       
                        let template = document.createElement("template");
                        let contentNode = tboardMng.elements.detailType2.dtlFld.editType1.cloneNode(true);
                        contentNode.dataset.tboardArtclNo = artclNo;
                        
                        value = value.replace(/\n/g, "<br>");                        
                        template.innerHTML = value;
                        contentNode.appendChild(template.content);

                        //마지막 위치
                        let lastEl = Array.from(viewEl.querySelectorAll(`[data-tboard-fld-type="dtlFld.editType1"]`)).pop();
                        if (lastEl.tboardArtclNo) {
                            lastEl.after(contentNode);
                        }
                        else {
                            lastEl.replaceWith(contentNode);
                        }
                        //TODO css 수정 필요
                        contentNode.style.wordBreak = "break-word";
                    }
                    else if (ctlInfo.cpt === "defaultType1") {
                        let contentNode = tboardMng.elements.detailType2.dtlFld.defaultType1.cloneNode(true);

                        let tboardFldType = contentNode.dataset.tboardFldType;
                        let grpKey = tboardFldType.split(".")[0];

                        let grpNode = viewEl.querySelector(`[data-tboard-fld-grp="${grpKey}"]`);
                        grpNode.appendChild(contentNode);
                        contentNode.textContent = value;
                    }
                    else if (ctlInfo.cpt === "defaultType2") {
                        let contentNode = tboardMng.elements.detailType2.dtlFld.defaultType1.cloneNode(true);

                        let tboardFldType = contentNode.dataset.tboardFldType;
                        let grpKey = tboardFldType.split(".")[0];

                        let grpNode = viewEl.querySelector(`[data-tboard-fld-grp="${grpKey}"]`);
                        grpNode.appendChild(contentNode);
                        contentNode.textContent = `${artclNm}: ${value}`;
                    }
                    else if (ctlInfo.cpt === "thumbType1") {
                        if (Array.isArray(atcflData) === false || atcflData.length < 1) {
                            return;
                        }

                        //tboardMng.elements.detailType2.dtlFld.thumbType1
                        let procEl = viewEl.querySelector(`[data-tboard-fld-type*="thumbType1"]`);
                        let inputData = {};
                        inputData.authKey = "basicRead";
                        inputData.data = {
                            pstNo: pstData.pstNo
                            , artclNo: artclNo
                            , bbsAtcflNo: "all"                            
                        };
                        inputData.scb = (_result) => {
                            let thumbList = _result.response.thumbGrid || [];
                            if (!Array.isArray(thumbList) || thumbList.length < 1) {
                                return;
                            }
                            let imageBase64 = thumbList[0].imageBase64;
                            procEl.style.backgroundImage = `url(${imageBase64})`;
                        }
                        this.tboardArtcl.tboardInstance.bbsFn.getImageFromBase64(inputData);
                    }
                    else if (ctlInfo.cpt === "itemType1") {
                        let itemRootEl   = tboardMng.elements.detailType2.itemType1.root.cloneNode(true);
                        let artclNmEl    = tboardMng.elements.detailType2.itemType1.artclNm.cloneNode(true);
                        let artclValueEl = tboardMng.elements.detailType2.itemType1.artclValue.cloneNode(true);
                        
                        itemRootEl.dataset.tboardArtclNo = artclNo;
                        artclNmEl.textContent    = artclNm;
                        artclValueEl.textContent = value;
                        itemRootEl.appendChild(artclNmEl);
                        itemRootEl.appendChild(artclValueEl);

                        viewEl.querySelector(`[data-tboard-fld-grp="itemInfo"]`).appendChild(itemRootEl);
                    }
                    else if (ctlInfo.cpt === "atchType1") {
                        //항목 별 첨부파일로 분리
                        let atchFileList = atcflData.filter( _data => {return _data.bbsAtcflNo.indexOf(artclNo) > -1});
                        if (atchFileList.length < 1) {
                            return;
                        }

                        let contentNode    = tboardMng.elements.detailType2.atchFld.root.cloneNode(true);
                        let fileInfoNode   = tboardMng.elements.detailType1.atchFld.info.cloneNode(true);
                        let btnAllDownNode = tboardMng.elements.detailType1.atchFld.btnAll.cloneNode(true);

                        contentNode.dataset.tboardArtclNo = artclNo;
                        fileInfoNode.querySelector(`[data-tboard-fld-id="atchCnt"]`).textContent = atchFileList.length || 0;
                        btnAllDownNode.addEventListener("click", () => {
                            let fileDown = {
                                pstNo: pstData.pstNo
                                , artclNo: artclNo
                                , bbsAtcflNo: "all"
                                , pstNm: pstData.pstNm
                                , fileNm: ""
                            }
                            this.tboardArtcl.tboardInstance.bbsEvent.fileDownload(fileDown);
                        });
                        contentNode.appendChild(fileInfoNode);
                        contentNode.appendChild(btnAllDownNode);

                        //item 추가
                        for (const fileInfo of atchFileList) {
                            let fileName  = fileInfo.bbsOrgnlAtcflNm;
                            let fileSize  = tboardUtil.formatBytes(fileInfo.bbsAtcflSz);
                            let dispValue = `${fileName} [${fileSize}]`;
                            
                            let fileItem = tboardMng.elements.detailType1.atchFld.item.cloneNode(true);
                            fileItem.querySelector(`[data-tboard-fld-id="atchFileNm"]`).textContent = dispValue;

                            let btnDown = fileItem.querySelector("button");
                            btnDown.addEventListener("click", () => {
                                let fileDown = {
                                    pstNo: pstData.pstNo
                                    , artclNo: artclNo
                                    , bbsAtcflNo: fileInfo.bbsAtcflNo                                    
                                    , pstNm: pstData.pstNm
                                    , fileNm: fileInfo.bbsOrgnlAtcflNm
                                }
                                this.tboardArtcl.tboardInstance.bbsEvent.fileDownload(fileDown);
                            });

                            contentNode.appendChild(fileItem);
                        }

                        //마지막 위치
                        let lastEl = Array.from(viewEl.querySelectorAll(`[data-tboard-fld-type="dtlFld.atchType1"]`)).pop();
                        if (lastEl.tboardArtclNo) {
                            lastEl.after(contentNode);
                        }
                        else {
                            lastEl.replaceWith(contentNode);
                        }
                    }
                });

                //기타노드(이전,다음,버튼)
                Object.keys(tboardMng.elements.detailType1.etcFld).forEach( _key => {
                    let etcNode    = tboardMng.elements.detailType1.etcFld[_key].cloneNode(true);
                    let sourceNode = viewEl.querySelector(`[data-tboard-fld-type="${etcNode.dataset.tboardFldType}"]`);
                    sourceNode.replaceWith(etcNode);
                });


                //이전, 다음
                let prevDetail = viewEl.querySelector(`[data-tboard-fld-id="prevDetail"]`);
                let nextDetail = viewEl.querySelector(`[data-tboard-fld-id="nextDetail"]`);

                if (movePstData.prevPstNo === "none") {
                    prevDetail.textContent = "이전 글이 없습니다.";
                }
                else {
                    while(prevDetail.firstChild) {
                        prevDetail.firstChild.remove();
                    }
                    let aLink = document.createElement("a");
                    aLink.href = "javascript:void(0);"
                    aLink.textContent = movePstData.prevPstNm;
                    
                    aLink.addEventListener("click", () => {
                        let input = {
                            bbsId: pstData.bbsId
                            , pstNo: movePstData.prevPstNo
                        }
                        let args = {
                            key: "basicRead.view"
                            , data: input
                        };
                        this.tboardArtcl.tboardInstance.bbsEvent.handleEvent(args);
                    });
                    prevDetail.appendChild(aLink);
                }

                if (movePstData.nextPstNo === "none") {
                    nextDetail.textContent = "다음 글이 없습니다.";
                }
                else {
                    while(nextDetail.firstChild) {
                        nextDetail.firstChild.remove();
                    }
                    let aLink = document.createElement("a");
                    aLink.href = "javascript:void(0);"
                    aLink.textContent = movePstData.nextPstNm;
                    aLink.addEventListener("click", () => {
                        let input = {
                            bbsId: pstData.bbsId
                            , pstNo: movePstData.nextPstNo
                        }
                        let args = {
                            key: "basicRead.view"
                            , data: input
                        };
                        this.tboardArtcl.tboardInstance.bbsEvent.handleEvent(args);
                    });

                    nextDetail.appendChild(aLink);
                }
            }
        }

        WriteComponent = class {
            constructor(_instance, _ctlInfo) {
                this.tboardArtcl = _instance;
                this.viewType    = this.tboardArtcl.tboardInstance.viewType["write"];
                this.elMng       = tboardMng.elementsInstance;
                
                this.comCodeMng  = this.tboardArtcl.tboardInstance.bbsComGrpCd;

                this.ctlInfo     = _ctlInfo; //제어정보
                this.type        = this.ctlInfo.cpt;
                this.optType     = this.ctlInfo.optType || ""; //비밀글, 공지 등
                
                this.artclInfo   = this.tboardArtcl.user.info[ _ctlInfo.artclNo ]; //항목정보
                this.artclNm     = this.tboardArtcl.getArtclNm( _ctlInfo.artclNo); //항목명
                this.indctYn     = this.tboardArtcl.getIndctYn( _ctlInfo.artclNo); //표시여부

                //초기화
                this.artclNos    = this.artclNos || {};
                this.artclNos[_ctlInfo.artclNo] = ""; //항목번호

                this.node        = undefined;
                this.editor      = undefined;                
                this.editorTheme = {theme: "snow"};
                this.labelNode   = undefined; //라벨노드
                this.files       = {};
                this.fileInfo    = {
                    preFileList: {}
                };
                
                this.formEl = {};
                this.isValid = true;
                this.init();
            }

            init() {
                if (this.optType === "pstSeCd") {
                    this.subType = "notice";
                    
                    this.notice();
                    this.setInitValue();
                }
                else if (this.optType === "rlsYn") {
                    this.subType = "secret";
                    this.secret();
                    this.setInitValue();
                }
                else if (this.optType === "thumb") {
                    this.subType = "thumb";
                    this.thumb();
                    this.setInitValue();
                }
                else if (typeof this[ this.type ] === "function") {
                    if (!tboardMng.elements.writeType1.writeFld[this.type]) {
                        //console.log("--------------------error");
                        return;
                    }
                    //노드복사
                    this.node = tboardMng.elements.writeType1.writeFld[this.type].cloneNode(true);

                    //라벨(항목명)
                    this.labelNode = this.node.querySelector(`[class="tboard_write_label"]`);
                    if (this.labelNode) {
                        this.labelNode.textContent = this.artclNm;
                    }
                    
                   //tboardMng.elements.writeType1.writeFld
                    this[ this.type ]();

                    //초기값 세팅
                    this.setInitValue(this.ctlInfo.ini);

                    //마스크
                    this.setMaskEvent();
                }
            }

            setStyle(_args) {
                let defaultType = ["inputType1", "checkType1", "selectType1", "radioType1", "textareaType1", "dateType1", "dateperiodType1"];
                let inputEls    = [];
                let selectEls   = [];
                let textAreaEls = [];

                try {
                    if (defaultType.includes(this.type)) {
                        inputEls    = this.node.querySelectorAll("input");
                        selectEls   = this.node.querySelectorAll("select");
                        textAreaEls = this.node.querySelectorAll("textArea");
                    }
                    Object.keys(_args).forEach( _key => {
						let attrNm = _key;
						let value  = _args[_key];
                        if (attrNm === "readonly") {
                            inputEls.forEach( el => {
                                el.setAttribute(attrNm, value);
                                el.style.backgroundColor = "#f0f0f0";
                                el.style.borderColor = "#f0f0f0";
                            });
                            selectEls.forEach( el => {
                                el.disabled = true;
                                el.style.backgroundColor = "#f0f0f0";
                                el.style.borderColor = "#f0f0f0";
                            });
                            textAreaEls.forEach( el => {
                                el.disabled = true;
                            });
                        }
                        else if (attrNm === "disabled") {
                            inputEls.forEach( el => {
                                el.disabled = true;
                                el.style.backgroundColor = "#f0f0f0";
                                el.style.borderColor = "#f0f0f0";
                            });
                            selectEls.forEach( el => {
                                el.disabled = true;
                                el.style.backgroundColor = "#f0f0f0";
                                el.style.borderColor = "#f0f0f0";
                            });
                            textAreaEls.forEach( el => {
                                el.disabled = true;
                            });
                        }
                    });
                }
                catch(error) {
                    inputEls = []; selectEls = []; textAreaEls = [];
                }
            }

            //초기값
            setInitValue(_initData) {
                let initValue = _initData;

                if (this.subType === "notice") {
                    if (typeof initValue !== "object") {
                        initValue = {pstSeCd: "", pstSortSeq: 0};
                    }

                    let checkEl = this.formEl.checkItem.querySelector(`input[type="checkbox"]`);
                    let inputEl = this.formEl.inputItem.querySelector("input");
                    checkEl.checked = false;
                    if (initValue.pstSeCd === "1200002") {
                        checkEl.checked = true;
                    }
    
                    inputEl.value = initValue.pstSortSeq;
                }
                else if (this.subType === "secret") {
                    initValue = initValue || "Y";
                    if (typeof initValue !== "string") {
                        initValue = "";
                    }                    
                    
                    let radios = this.formEl.radioItem.querySelectorAll(`input[type="radio"]`);
                    radios.forEach( _radio => {
                        if (!initValue) {
                            _radio.checked = false;
                            return;
                        }
                        if (_radio.value === initValue) {
                            _radio.checked = true;
                        }
                        else {
                            _radio.checked = false;
                        }
                    });
                }
                else if (this.type === "textType1") {
                    initValue = initValue || "";
                    if (typeof initValue !== "string") {
                        initValue = "";
                    }

                    let procNode = this.node.querySelector("input");
                    if (!procNode) {
                        return;
                    }

                    if (this.ctlInfo.mask) {
                        initValue = this.setMask(initValue || "");
                    }
                    
                    procNode.value = initValue || "";
                    //console.log("procNode.value ", procNode.value);
                }
                else if (this.type === "inputType1") {
                    initValue = initValue || "";
                    if (typeof initValue !== "string") {
                        initValue = "";
                    }

                    let procNode = this.node.querySelector("input");
                    if (!procNode) {
                        return;
                    }

                    if (this.ctlInfo.mask) {
                        this.setMask(initValue || "");
                    }
                    else {
                        
                    }
                    procNode.value = initValue || "";
                }
                else if(this.type === "editType1") {                    
                    if (this.editor) {              
                        initValue = initValue || "";
                        if (typeof initValue !== "string") {
                            initValue = "";
                        }
                        this.editor.setContents([]);
                        this.editor.root.innerHTML = "";
                        if (initValue) {
                            let template = document.createElement("template");
                            template.innerHTML = initValue;
                            //this.editor.root.innerHTML = initValue;
                            //contentNode.appendChild(template.content);
                            this.editor.root.appendChild(template.content);
                            //window.editor = this.editor;
                        }

                        this.node.querySelector(".ql-editor").addEventListener("input", () => {
                            this.editor.getSelection();
                        }, {once:true});
                    }
                }
                else if(this.type === "textareaType1") {
                    initValue = initValue || "";
                    if (typeof initValue !== "string") {
                        initValue = "";
                    }

                    let procNode = this.node.querySelector("textarea");
                    if (!procNode) {
                        return;
                    }
                    
                    procNode.value = initValue;
                }
                else if(this.type === "selectType1") {
                    initValue = initValue || "";
                    if (typeof initValue !== "string") {
                        initValue = "";
                    }

                    let procNode = this.node.querySelector("select");
                    if (!procNode) {
                        return;
                    }

                    if (!initValue) { //값없으면 첫번째
                        procNode.selectedIndex = 0;
                        return;
                    }
                    procNode.value = initValue;
                }
                else if(this.type === "checkType1") {    
                    initValue = initValue || "";
                    if (typeof initValue !== "string") {
                        initValue = "";
                    }
                    initValue = initValue.split("|");

                    let checkboxes = this.node.querySelectorAll(`input[name*=${this.ctlInfo.artclNo}]`);
                    checkboxes.forEach( _check => {  
                        if (!initValue) {
                            _check.checked = false;
                            return;
                        }
                        
                        if (initValue.includes(_check.value)) {
                            _check.checked = true;
                        }
                        else {
                            _check.checked = false;
                        }
                    });
                    
                }
                else if(this.type === "radioType1") {
                    initValue = initValue || "";
                    if (typeof initValue !== "string") {
                        initValue = "";
                    }                    
                    
                    let radios = this.node.querySelectorAll(`input[name=${this.ctlInfo.artclNo}]`);
                    radios.forEach( _radio => {
                        if (!initValue) {
                            _radio.checked = false;
                            return;
                        }
                        if (_radio.value === initValue) {
                            _radio.checked = true;
                        }
                        else {
                            _radio.checked = false;
                        }
                    });
                }
                else if(this.type === "dateType1") {
                    initValue = initValue || "";
                    if (typeof initValue !== "string") {
                        initValue = "";
                    }     

                    let procNode = this.node.querySelector(`input[type="date"]`);
                    if (!procNode) {
                        return;
                    }
                    
                    if ("today" === initValue.toLowerCase()) {
                        let today = tboardUtil.getToday();
                        today = tboardUtil.dateFormat(today);
                        procNode.value = today;
                    }
                    else {
                        procNode.value = tboardUtil.dateFormat(initValue);;
                    }

                }
                else if(this.type === "dateperiodType1") {
                    initValue = initValue || "";
                    if (typeof initValue !== "string") {
                        initValue = "";
                    } 

                    let beginNode = this.node.querySelector(`[data-tboard-id="beign"]`);
                    let endNode   = this.node.querySelector(`[data-tboard-id="end"]`);
                    if (!beginNode || !endNode) {
                        return;
                    }
                    
                    if (!initValue) {
                        beginNode.value = "";
                        endNode.value = "";
                        return;
                    }

                    let beginInitValue = ""; 
                    let endInitValue   = "";

                    if (initValue.split("|").length === 2) {
                        beginInitValue = initValue.split("|")[0];
                        endInitValue   = initValue.split("|")[1];
                    } else if(initValue.split("|").length === 1) {
                        beginInitValue = initValue.split("|")[0];
                    }

                    let today = tboardUtil.dateFormat(tboardUtil.getToday());
                    if (beginInitValue) {
                        if ("today" === beginInitValue.toLowerCase()) {
                            beginNode.value = today;
                        }
                        else {
                            beginNode.value = tboardUtil.dateFormat(beginInitValue);
                        }
                    }

                    if (endInitValue) {
                        if ("today" === endInitValue.toLowerCase()) {
                            endNode.value = today;
                        }
                        else {
                            endNode.value = tboardUtil.dateFormat(endInitValue);
                        }
                    }
                }
                else if(this.type === "atchType1" || this.optType === "thumb") {
                    let fileGrpNode = this.node.querySelector(`[class="tboard_file_multilist"]`);
                    let atchCntNode = this.node.querySelector(`[data-tboard-id="atchCnt"]`);
                    let fileList    = initValue || [];

                    //파일아이템삭제
                    while(fileGrpNode.firstChild) {
                        fileGrpNode.firstChild.remove();
                    }

                    //WriteComponent
                    let objAtchCmp = this;
                    let fileCnt = fileList.length;
                    this.fileInfo.preFileList = {};
                    for (let i = 0; i < fileList.length; i++) {
                        let file       = fileList[i];
                        let fileName   = file.bbsOrgnlAtcflNm;
                        let fileSize   = file.bbsAtcflSz;
                        let fileSizeNm = tboardUtil.formatBytes(fileSize);
                        
                        //기등록파일목록
                        this.fileInfo.preFileList[file.bbsAtcflNo] = {
                            delYn: "N"
                        };
                        
                        //파일아이템 추가
                        let atchItem = tboardMng.elements.writeType1.atchFld.defaultType1.cloneNode(true);
                        atchItem.dataset.bbsAtcflNo = file.bbsAtcflNo;
                        
                        let fileInfo = `${fileName} [${fileSizeNm}]`;
                        let atchFileNmNode  = atchItem.querySelector(`[data-tboard-id="atchFileNm"]`); //파일명
                        let btnAtchFileNode = atchItem.querySelector("button"); //삭제버튼
                        
                        //파일정보 표시
                        atchFileNmNode.textContent = fileInfo;

                        //삭제버튼이벤트
                        btnAtchFileNode.addEventListener("click", () => {
                            //삭제 표시
                            this.fileInfo.preFileList[file.bbsAtcflNo].delYn = "Y";
                            atchItem.remove();

                            //기등건수 + 추가 업로드 건수
                            let addFileCnt = Object.keys(objAtchCmp.files).length;
                            let preFileCnt = 0;
                            Object.keys(this.fileInfo.preFileList).forEach(_key => {
                                if (this.fileInfo.preFileList[_key].delYn === "N") {
                                    preFileCnt = preFileCnt + 1;
                                }
                            });
                            atchCntNode.textContent = preFileCnt + addFileCnt;
                        });

                        //아이템추가
                        fileGrpNode.appendChild(atchItem);
                    }

                    //파일등록 건수
                    atchCntNode.textContent = String(fileCnt);
    
                    //파일초기화
                    if (this.node.querySelector(`input[type="file"]`)) {
                        this.node.querySelector(`input[type="file"]`).value = "";
                    }

                    //파일객체 초기화
                    this.files = {}; //파일초기화
                }
            }

            setMaskEvent() {
                if (!this.ctlInfo.mask) {
                    return;
                }

                if (this.type !== "inputType1") {
                    return;
                }

                let self = this;
                let mask = this.ctlInfo.mask;
                if (mask.toLowerCase() === "hp") {
                    let inputEl = this.node.querySelector("input");
                    inputEl.addEventListener("input", (e) => {
                        e.target.value = tboardUtil.formatPhoneNumber(e.target.value.trim());
                    });

                    inputEl.addEventListener("blur", (e) => {
                        let isValid = tboardUtil.isValidPhoneNumber(e.target.value.trim());
                        if (isValid === false) {                            
                            //let msg = tboardMsg.getMsg("msg_917", [`${self.artclNm}`]);
                            //tboardUtil.commonAlert( msg );                            
                            this.isValid = false;
                        }
                    });
                }
                else if (mask.toLowerCase() === "number") {
                    let inputEl = this.node.querySelector("input");
                    inputEl.addEventListener("input", (e) => {
                        e.target.value = tboardUtil.formatNumber(e.target.value);
                    });                    
                }
            }

            setMask(value) {
                if (!this.ctlInfo.mask) {
                    return;
                }

                if (this.type !== "inputType1") {
                    return;
                }

                let self = this;
                let mask = this.ctlInfo.mask;
                if (mask.toLowerCase() === "hp") {
                    return tboardUtil.formatPhoneNumber(value);
                }
                else if (mask.toLowerCase() === "number") {
                    return tboardUtil.formatNumber(value);
                }
                
                return value;
            }

            setFocus() {
                let procNode = null;
                if (this.type === "inputType1") {
                    procNode = this.node.querySelector("input");
                    procNode.focus();
                }
                /*else if(this.type === "editType1") {

                }*/
                else if(this.type === "textareaType1") {
                    procNode = this.node.querySelector("textarea");
                    procNode.focus();
                }
                else if(this.type === "selectType1") {
                    procNode = this.node.querySelector("select");
                    procNode.focus();
                }
                /*else if(this.type === "checkType1") {
                    
                }
                else if(this.type === "radioType1") {
                    
                }*/
                else if(this.type === "dateType1") {
                    procNode = this.node.querySelector(`input[type="date"]`);
                    procNode.focus();
                }
                else if(this.type === "dateperiodType1") {
                    procNode = this.node.querySelector(`[data-tboard-id="beign"]`); 
                    procNode.focus();
                }
                else if(this.type === "atchType1") {
                    
                }
            }


            getData() {
                let rtnData = {
                    artclNm: this.tboardArtcl.tboardInstance.bbsDfArtcl.get( this.ctlInfo.artclNo )
                    , artclNo: this.ctlInfo.artclNo
                    , data: ""
                };
                let procNode = null;

                if (this.subType === "notice") {
                    let checkEl = this.formEl.checkItem.querySelector(`input[type="checkbox"]`);
                    let inputEl = this.formEl.inputItem.querySelector("input");

                    rtnData.data = {
                        pstSeCd: "1200001"
                        , pstSortSeq: 0
                    };
                    if (checkEl.checked) {
                        rtnData.data.pstSeCd = "1200002";
                    }
                    rtnData.data.pstSortSeq = inputEl.value || 0;
    
                    return rtnData;
                }
                else if (this.subType === "secret") {                    
                    rtnData.data = "Y";
                    let radioEl = this.formEl.radioItem.querySelector(`input[type="radio"]:checked`);
                    if (radioEl) {
                        rtnData.data = radioEl.value;
                    }
                    return rtnData;
                }
                else if(this.subType === "thumb") {
                    //console.log("---------------thumb");
                    rtnData.data = this.files;
                    rtnData.delFiles = [];
                    //삭제파일
                    Object.keys(this.fileInfo.preFileList).forEach( _fileNo => {
                        //console.log(this.fileInfo.preFileList[_fileNo]);
                        if (this.fileInfo.preFileList[_fileNo].delYn === "Y") {
                            rtnData.delFiles.push(_fileNo);
                        }
                    });
                }
                else if (this.type === "inputType1") {
                    procNode = this.node.querySelector("input");
                    rtnData.data = procNode.value || "";
                }
                else if(this.type === "editType1") {
                    if (this.editor) {                        
                        let content  = this.editor.root.innerHTML;
                        content = encodeURIComponent( content );
                        //let content  = JSON.stringify(this.editor.getContents());
				        //let delHtml  = content.replace(/<[^>]*>?/g, '');
                        rtnData.data = content;
                    }
                }
                else if(this.type === "textareaType1") {
                    procNode = this.node.querySelector("textarea");
                    rtnData.data = procNode.value || "";
                }
                else if(this.type === "selectType1") {
                    procNode = this.node.querySelector("select");
                    rtnData.data = procNode.value || "";
                }
                else if(this.type === "checkType1") {
                    rtnData.data = Array.from(this.node.querySelectorAll(`input[name="${this.ctlInfo.artclNo}"]:checked`))
                                                .map(checkbox => checkbox.value)
                                                .join('|') || "";
                }
                else if(this.type === "radioType1") {
                    let procNode = this.node.querySelector(`input[name="${this.ctlInfo.artclNo}"]:checked`);
                    if (procNode) {
                        rtnData.data = procNode.value;
                    }
                }
                else if(this.type === "dateType1") {
                    rtnData.data = this.node.querySelector(`input[type="date"]`).value || "";
                    rtnData.data = rtnData.data.replace(/-/g, "");
                }
                else if(this.type === "dateperiodType1") {
                    let beginDate = this.node.querySelector(`[data-tboard-id="beign"]`).value || ""; 
                    let endData   = this.node.querySelector(`[data-tboard-id="end"]`).value || "";
                    beginDate = beginDate.replace(/-/g, "");
                    endData   = endData.replace(/-/g, "");
                    
                    rtnData.data = beginDate + "|" + endData;
                }
                else if(this.type === "atchType1") {
                    //console.log("---------------file");
                    rtnData.data = this.files;
                    rtnData.delFiles = [];
                    //삭제파일
                    Object.keys(this.fileInfo.preFileList).forEach( _fileNo => {
                        //console.log(this.fileInfo.preFileList[_fileNo]);
                        if (this.fileInfo.preFileList[_fileNo].delYn === "Y") {
                            rtnData.delFiles.push(_fileNo);
                        }
                    });
                }

                return rtnData;
            }

            notice() {
                //노드복사
                this.formEl.checkItem = tboardMng.elements.writeType1.writeFld["checkType1"].cloneNode(true);
                this.formEl.inputItem = tboardMng.elements.writeType1.writeFld["inputType1"].cloneNode(true);
                
                this.formEl.checkItem.dataset.tboardArtclNo = "pstSeCd";
                this.formEl.inputItem.dataset.tboardArtclNo = "pstSortSeq";

                this.formEl.checkItem.querySelector(`[class="tboard_write_label"]`).textContent = this.artclNm;
                this.formEl.inputItem.querySelector(`[class="tboard_write_label"]`).textContent = "중요도";

                //공지여부
                let checkGrp  = this.formEl.checkItem.querySelector("[class='tboard_check']").cloneNode(true);
                let spanNode  = checkGrp.querySelector("span");
                let checkNode = checkGrp.querySelector(`input[type="checkbox"]`);
                
                spanNode.textContent = "공지여부";
                checkNode.value = "Y";
                checkNode.id    = `${tboardUtil.uuidGen()}_pstSeCd`;
                checkNode.name  = "pstSeCd";

                //삭제
                let procNode = this.formEl.checkItem.querySelector(`[class="tboard_write_input"]`);
                while (procNode.firstChild) {
                    procNode.firstChild.remove();
                }
                procNode.appendChild(checkGrp);
                    
                //공지중요도    
                let inputEl = this.formEl.inputItem.querySelector("input");
                inputEl.addEventListener("input", function() {
                    this.value = this.value.replace(/[^0-9.-]/g, "");

                    if (this.value.length > 7) {
                        this.value = this.value.substring(0, 7);
                    }
                });
                inputEl.type = "number";
                inputEl.title = "중요도";
                inputEl.setAttribute("placeholder", `공지 중요도값을 입력하세요.`);
            }

            secret() {
                //라디오 아이템
                this.formEl.radioItem = tboardMng.elements.writeType1.writeFld["radioType1"].cloneNode(true);
                this.formEl.radioItem.dataset.tboardArtclNo = this.ctlInfo.artclNo;

                //라벨
                this.formEl.radioItem.querySelector(`[class="tboard_write_label"]`).textContent = "비밀글";
                
                //라디오그룹
                let radioGrp = this.formEl.radioItem.querySelector("[class='tboard_radio']").cloneNode(true);

                //라디오 그룹이 들어가는 위치
                let procNode = this.formEl.radioItem.querySelector("[class='tboard_write_input']");
                //삭제
                while(procNode.firstChild) {
                    procNode.firstChild.remove();
                }

                //비밀글
                let codeList = [
                    {comCd:"Y", comCdNm: "공개"}
                    , {comCd:"N", comCdNm: "비공개"}
                ];

                let cmpId = `${tboardUtil.uuidGen()}_${this.ctlInfo.artclNo}`;
                for (const objCode of codeList) {
                    let copyNode  = radioGrp.cloneNode(true);
                    let spanNode  = copyNode.querySelector("span");
                    let radioNode = copyNode.querySelector(`input[type="radio"]`);

                    spanNode.textContent = objCode.comCdNm;
                    radioNode.value = objCode.comCd;
                    radioNode.id    = cmpId;
                    radioNode.name  = this.ctlInfo.artclNo;

                    procNode.appendChild(copyNode);
                }
            }

            thumb() {

                //노드복사
                this.node = tboardMng.elements.writeType1.writeFld.atchType1.cloneNode(true);
                //라벨(항목명)
                this.labelNode = this.node.querySelector(`[class="tboard_write_label"]`);
                if (this.labelNode) {
                    this.labelNode.textContent = this.artclNm;
                }

                let config = this.tboardArtcl.tboardInstance.bbsConfig.thumb || {};

                //파일업로드 설정
                this.ctlInfo.config = this.ctlInfo.config || config;

                let atchConfig   = this.ctlInfo.config;

                //
                let fileSizeNode = this.node.querySelector(`[data-tboard-id="fileSize"]`);
                let fileExtNode  = this.node.querySelector(`[data-tboard-id="fileExt"]`);
                let btnAllDelete = this.node.querySelector(`[data-tboard-id="btnAllDelete"]`);
                let btnAddFile   = this.node.querySelector("[class='tboard_btn_file']");

                //파일등록 건수
                let fileGrpNode = this.node.querySelector(`[class="tboard_file_multilist"]`);
                let atchCntNode = this.node.querySelector(`[data-tboard-id="atchCnt"]`);
                
                //등록가능 확장자
                let posibleExt = atchConfig.ext.split("|").map(ext => ext).join(', ');
                let convertSize = tboardUtil.formatBytes(atchConfig.maxSize);

                fileSizeNode.textContent = `※ ${convertSize} 이하의 파일만 업로드 가능 [최대 ${atchConfig.maxCnt} 건]`;
                fileExtNode.textContent  = posibleExt;

                //파일 input 생성
                if (this.node.querySelector(`input[type="file"]`)) { //있으면 삭제
                    this.node.querySelector(`input[type="file"]`).remove();
                }
                let acceptType = atchConfig.ext.split("|").map(ext => "." + ext).join(",");
                let fileInput  = document.createElement("input");
                let uniqFileId = "tboard_" + tboardUtil.uuidGen();
                fileInput.type = "file";
                fileInput.multiple = true;
                fileInput.style.display  = "none";
                fileInput.dataTboardFile = "tboardFile"
                fileInput.setAttribute("accept", acceptType);
                fileInput.id = uniqFileId;
                //클릭 이벤트
                this.node.appendChild(fileInput);
                btnAddFile.setAttribute("onclick", `document.getElementById('${uniqFileId}').click();`);
                
                let objAtchCmp = this;
                let fileChange = async (event) => {     
                    try {
                        //기등건수 + 추가 업로드 건수
                        let addFileCnt = Object.keys(objAtchCmp.files).length;
                        let preFileCnt = 0;
                        Object.keys(this.fileInfo.preFileList).forEach(_key => {
                            if (this.fileInfo.preFileList[_key].delYn === "N") {
                                preFileCnt = preFileCnt + 1;
                            }
                        });
                        //등록 건수
                        let totalFileCnt = preFileCnt + addFileCnt + event.target.files.length;

                        //선택한 파일목록
                        let fileList = event.target.files;
                        if (fileList.length < 1) {
                            return;
                        }

                        //파일수체크
                        if (totalFileCnt > atchConfig.maxCnt) {                            
                            tboardUtil.commonAlert( tboardMsg.getMsg("msg_807") );
                            return;
                        }

                        //확장자
                        let isPossibleExt  = true;
                        let isPossibleSize = true;
                        const allowedExt   = atchConfig.ext.split("|");
                        //const maxByte      = tboardUtil.convertMBtoByte(atchConfig.maxSize);
                        const maxByte      = atchConfig.maxSize;
                        for (let i = 0; i < fileList.length; i++) {
                            let file     = fileList[i];
                            let fileName = file.name;
                            let fileSize = file.size;
                            let checkExt = fileName.split(".").pop().toLowerCase();
                            if (allowedExt.includes(checkExt) === false) {
                                isPossibleExt = false;
                                break;
                            }
                            isPossibleSize = tboardUtil.possibleUploadFileSize(maxByte, fileSize);
                            if (isPossibleSize === false) {
                                break;
                            }
                        }

                        if (isPossibleExt === false) {                            
                            tboardUtil.commonAlert( tboardMsg.getMsg("msg_808") );
                            return;
                        }
                        if (isPossibleSize === false) {
                            tboardUtil.commonAlert( tboardMsg.getMsg("msg_809") );
                            return;
                        }

                        for (let i = 0; i < fileList.length; i++) {
                            let file       = fileList[i];
                            let fileName   = file.name;
                            let fileSize   = 0;
                            let fileSizeNm = "";
                            
                            let imgDataObj = null;
                            try {
                                imgDataObj = await tboardImgUtil.imageConversion(file);    
                                fileSize   = tboardImgUtil.getBase64ImageSize(imgDataObj.convBase64);
                                fileSizeNm = tboardUtil.formatBytes(fileSize);
                            }
                            catch(error) {
                                return;
                            }
                            
                            //console.log("imgDataObj",imgDataObj);

                            //전체파일관리 객체
                            let fileId = tboardUtil.uuidGen();
                            this.files[fileId] = imgDataObj;

                            let atchItem = tboardMng.elements.writeType1.atchFld.defaultType1.cloneNode(true);
                            atchItem.dataset.tboardFileId = fileId;
                            
                            let fileInfo = `${fileName} [${fileSizeNm}]`;
                            let atchFileNmNode  = atchItem.querySelector(`[data-tboard-id="atchFileNm"]`); //파일명
                            let btnAtchFileNode = atchItem.querySelector("button"); //삭제버튼

                            //파일정보 표시
                            atchFileNmNode.textContent = fileInfo;
                            
                            //삭제버튼이벤트
                            btnAtchFileNode.addEventListener("click", () => {
                                if (objAtchCmp.files[atchItem.dataset.tboardFileId]) {
                                    delete objAtchCmp.files[atchItem.dataset.tboardFileId];
                                }
                                atchItem.remove();

                                //기등건수 + 추가 업로드 건수
                                let addFileCnt = Object.keys(objAtchCmp.files).length;
                                let preFileCnt = 0;
                                Object.keys(this.fileInfo.preFileList).forEach(_key => {
                                    if (this.fileInfo.preFileList[_key].delYn === "N") {
                                        preFileCnt = preFileCnt + 1;
                                    }
                                });
                                atchCntNode.textContent = preFileCnt + addFileCnt;
                            });

                            //아이템추가
                            fileGrpNode.appendChild(atchItem);
                        }

                        //등록건수 표시
                        atchCntNode.textContent = totalFileCnt;
                    }
                    catch(error) {
                        console.log(error);
                    }
                    finally {
                        //값초기화
                        document.querySelector(`[id=${uniqFileId}]`).value = "";
                    }
                };
                
                //변경 이벤트
                fileInput.addEventListener("change", fileChange.bind(this));

                //전체삭제
                btnAllDelete.addEventListener("click", () => {
                    while(fileGrpNode.firstChild) {
                        fileGrpNode.firstChild.remove();
                    }
                    atchCntNode.textContent = 0; //파일건수
                    
                    this.files = {}; //파일초기화
                    //삭제 표시
                    Object.keys(this.fileInfo.preFileList).forEach(_key => {
                        this.fileInfo.preFileList[_key].delYn = 'Y';
                    });
                });

            }
            
            inputType1() {
                let procNode = this.node.querySelector("input");
                procNode.title = this.artclNm;
                procNode.setAttribute("placeholder", `${this.artclNm}을 입력하세요.`);
                if (this.ctlInfo.viewonly === "Y") {
                    procNode.setAttribute("placeholder", "");
                    this.setStyle({readonly:"true"});
                }
            }
            
            editType1() {
                let procNode = this.node.querySelector(`[class="tboard_write_input"]`);
                while(procNode.firstChild) {
                    procNode.firstChild.remove();
                }
                
                procNode.style.display = "grid";
                procNode.style.gridTemplateColumns = "1fr";

                let editorDiv = document.createElement("div");
                editorDiv.dataset.tboardArtclNo = this.ctlInfo.artclNo;
                procNode.appendChild(editorDiv);

                this.editor = new Quill(editorDiv, this.editorTheme);
                this.editor.container.dataset.tboardEl = "Y"
                this.editor.container.querySelector(".ql-editor").dataset.tboardEl = "Y"
            }

            selectType1() {
                let procNode = this.node.querySelector("select");
                while(procNode.firstChild) {
                    procNode.firstChild.remove();
                }

                //공통코드 가져오기
                let datasource = this.ctlInfo.src;
                let codeType   = this.ctlInfo.cct;
                let codeList   = this.comCodeMng.getCodeList(codeType, datasource);

                for (const objCode of codeList) {
                    let option = document.createElement("option");
                    option.value = objCode.comCd;
                    option.textContent = objCode.comCdNm;

                    procNode.appendChild(option);
                }
            }

            radioType1() {
                //라디오그룹
                let radioGrp = this.node.querySelector("[class='tboard_radio']").cloneNode(true);

                //라디오 들어가는 위치
                let procNode = this.node.querySelector("[class='tboard_write_input']");
                //삭제
                while(procNode.firstChild) {
                    procNode.firstChild.remove();
                }

                //공통코드 가져오기
                let datasource = this.ctlInfo.src;
                let codeType   = this.ctlInfo.cct;
                let codeList   = this.comCodeMng.getCodeList(codeType, datasource);
                
                for (const objCode of codeList) {
                    let copyNode = radioGrp.cloneNode(true);
                    let spanNode = copyNode.querySelector("span");
                    let radioNode = copyNode.querySelector(`input[type="radio"]`);

                    spanNode.textContent = objCode.comCdNm;

                    radioNode.value = objCode.comCd;
                    radioNode.id   = `${this.ctlInfo.artclNo}_${objCode.comCd}`;
                    radioNode.name = this.ctlInfo.artclNo;

                    //radioGrp.setAttribute("for", `${this.ctlInfo.artclNo}_${objCode.comCd}`);

                    procNode.appendChild(copyNode);
                }
            }

            checkType1() {

                //체크그룹
                let checkGrp = this.node.querySelector("[class='tboard_check']").cloneNode(true);

                //체크 들어가는 위치
                let procNode = this.node.querySelector("[class='tboard_write_input']");
                //삭제
                while(procNode.firstChild) {
                    procNode.firstChild.remove();
                }

                //공통코드 가져오기
                let datasource = this.ctlInfo.src;
                let codeType   = this.ctlInfo.cct;
                let codeList   = this.comCodeMng.getCodeList(codeType, datasource);
                
                for (const objCode of codeList) {
                    let copyNode  = checkGrp.cloneNode(true);
                    let spanNode  = copyNode.querySelector("span");
                    let checkNode = copyNode.querySelector(`input[type="checkbox"]`);

                    spanNode.textContent = objCode.comCdNm;

                    checkNode.value = objCode.comCd;
                    checkNode.id    = `${this.ctlInfo.artclNo}_${objCode.comCd}`;
                    checkNode.name  = this.ctlInfo.artclNo;

                    procNode.appendChild(copyNode);
                }
            }

            dateType1() {
                //let procNode = this.node.querySelector("input");
               

            }

            dateperiodType1() {
                let procNode = this.node.querySelectorAll("input");
                if (procNode.length === 2) {
                    let beginNode = procNode[0];
                    let endNode   = procNode[1];
                    beginNode.dataset.tboardId = "beign";
                    endNode.dataset.tboardId = "end";
                }
            }

            textareaType1() {
                let procNode = this.node.querySelectorAll("textarea"); 
            }


            atchType1() {
                //파일업로드 설정
                let config = this.tboardArtcl.tboardInstance.bbsConfig.file || {};
                this.ctlInfo.config = this.ctlInfo.config || config;

                let atchConfig   = this.ctlInfo.config;
                //
                let fileSizeNode = this.node.querySelector(`[data-tboard-id="fileSize"]`);
                let fileExtNode  = this.node.querySelector(`[data-tboard-id="fileExt"]`);
                let btnAllDelete = this.node.querySelector(`[data-tboard-id="btnAllDelete"]`);
                let btnAddFile   = this.node.querySelector("[class='tboard_btn_file']");

                //파일등록 건수
                let fileGrpNode = this.node.querySelector(`[class="tboard_file_multilist"]`);
                let atchCntNode = this.node.querySelector(`[data-tboard-id="atchCnt"]`);
                
                //등록가능 확장자
                let posibleExt = atchConfig.ext.split("|").map(ext => ext).join(', ');
                let convertSize = tboardUtil.formatBytes(atchConfig.maxSize);

                fileSizeNode.textContent = `※ ${convertSize} 이하의 파일만 업로드 가능 [최대 ${atchConfig.maxCnt} 건]`;
                fileExtNode.textContent  = posibleExt;

                //파일 input 생성
                if (this.node.querySelector(`input[type="file"]`)) { //있으면 삭제
                    this.node.querySelector(`input[type="file"]`).remove();
                }
                let acceptType = atchConfig.ext.split("|").map(ext => "." + ext).join(",");
                let fileInput  = document.createElement("input");
                let uniqFileId = "tboard_" + tboardUtil.uuidGen();
                fileInput.type = "file";
                fileInput.multiple = true;
                fileInput.style.display  = "none";
                fileInput.dataTboardFile = "tboardFile"
                fileInput.setAttribute("accept", acceptType);
                fileInput.id = uniqFileId;
                //클릭 이벤트
                this.node.appendChild(fileInput);
                btnAddFile.setAttribute("onclick", `document.getElementById('${uniqFileId}').click();`);
                
                let objAtchCmp = this;
                let fileChange = (event) => {     
                    try {

                        //기등건수 + 추가 업로드 건수
                        let addFileCnt = Object.keys(objAtchCmp.files).length;
                        let preFileCnt = 0;
                        Object.keys(this.fileInfo.preFileList).forEach(_key => {
                            if (this.fileInfo.preFileList[_key].delYn === "N") {
                                preFileCnt = preFileCnt + 1;
                            }
                        });
                        //등록 건수
                        let totalFileCnt = preFileCnt + addFileCnt + event.target.files.length;

                        //선택한 파일목록
                        let fileList = event.target.files;
                        if (fileList.length < 1) {
                            return;
                        }

                        //파일수체크
                        if (totalFileCnt > atchConfig.maxCnt) {
                            tboardUtil.commonAlert( tboardMsg.getMsg("msg_807") );
                            return;
                        }

                        //확장자
                        let isPossibleExt  = true;
                        let isPossibleSize = true;
                        const allowedExt   = atchConfig.ext.split("|");
                        //const maxByte      = tboardUtil.convertMBtoByte(atchConfig.maxSize);
                        const maxByte      = atchConfig.maxSize;
                        for (let i = 0; i < fileList.length; i++) {
                            let file     = fileList[i];
                            let fileName = file.name;
                            let fileSize = file.size;
                            let checkExt = fileName.split(".").pop().toLowerCase();
                            if (allowedExt.includes(checkExt) === false) {
                                isPossibleExt = false;
                                break;
                            }
                            isPossibleSize = tboardUtil.possibleUploadFileSize(maxByte, fileSize);
                            if (isPossibleSize === false) {
                                break;
                            }
                        }

                        if (isPossibleExt === false) {
                            tboardUtil.commonAlert( tboardMsg.getMsg("msg_808") );
                            return;
                        }
                        if (isPossibleSize === false) {
                            tboardUtil.commonAlert( tboardMsg.getMsg("msg_809") );
                            return;
                        }

                        for (let i = 0; i < fileList.length; i++) {
                            let file       = fileList[i];
                            let fileName   = file.name;
                            let fileSize   = file.size;
                            let fileSizeNm = tboardUtil.formatBytes(fileSize);
                            
                            //전체파일관리 객체
                            let fileId = tboardUtil.uuidGen();
                            this.files[fileId] = file;

                            let atchItem = tboardMng.elements.writeType1.atchFld.defaultType1.cloneNode(true);
                            atchItem.dataset.tboardFileId = fileId;
                            
                            let fileInfo = `${fileName} [${fileSizeNm}]`;
                            let atchFileNmNode  = atchItem.querySelector(`[data-tboard-id="atchFileNm"]`); //파일명
                            let btnAtchFileNode = atchItem.querySelector("button"); //삭제버튼

                            //파일정보 표시
                            atchFileNmNode.textContent = fileInfo;
                            
                            //삭제버튼이벤트
                            btnAtchFileNode.addEventListener("click", () => {
                                if (objAtchCmp.files[atchItem.dataset.tboardFileId]) {
                                    delete objAtchCmp.files[atchItem.dataset.tboardFileId];
                                }
                                atchItem.remove();

                                //기등건수 + 추가 업로드 건수
                                let addFileCnt = Object.keys(objAtchCmp.files).length;
                                let preFileCnt = 0;
                                Object.keys(this.fileInfo.preFileList).forEach(_key => {
                                    if (this.fileInfo.preFileList[_key].delYn === "N") {
                                        preFileCnt = preFileCnt + 1;
                                    }
                                });
                                atchCntNode.textContent = preFileCnt + addFileCnt;
                            });

                            //아이템추가
                            fileGrpNode.appendChild(atchItem);
                        }

                        //등록건수 표시
                        atchCntNode.textContent = totalFileCnt;
                    }
                    catch(error) {
                        console.log(error);
                    }
                    finally {
                        //값초기화
                        document.querySelector(`[id=${uniqFileId}]`).value = "";
                    }
                };
                
                //변경 이벤트
                fileInput.addEventListener("change", fileChange.bind(this));

                //전체삭제
                btnAllDelete.addEventListener("click", () => {
                    while(fileGrpNode.firstChild) {
                        fileGrpNode.firstChild.remove();
                    }
                    atchCntNode.textContent = 0; //파일건수
                    
                    this.files = {}; //파일초기화
                    //삭제 표시
                    Object.keys(this.fileInfo.preFileList).forEach(_key => {
                        this.fileInfo.preFileList[_key].delYn = 'Y';
                    });
                });
            }
        }


        //searchType1 - HeaderComponent
        HeaderComponent = class {
            constructor(_instance) {
                this.type        = "header";
                this.viewType    = "";
                this.elMng       = tboardMng.elementsInstance;
                this.tboardArtcl = _instance;
                this.comCodeMng  = this.tboardArtcl.tboardInstance.bbsComGrpCd;
                this.node        = undefined;
            }

            append( _artclInfo) {
                let viewType      = _artclInfo.viewType; //searchType1
                let componentType = _artclInfo.cpt;

                //최초한번
                if (!this.node) {    
                    this.node = this.elMng.cloneListHeaderFld(viewType, "root");
                }

                //노드 생성
                //this[ componentType ]( _artclInfo );
                this.defaultType1( _artclInfo );                
            }

            //일반텍스트
            defaultType1( artclInfo ) {
                //노드 복사
                let copyNode = this.elMng.cloneListHeaderFld(artclInfo.viewType, "defaultType1");
                if (artclInfo.width) {
                    copyNode.style.width = `${artclInfo.width}px`;
                }
                else {
                    copyNode.style.width = "";
                }
                copyNode.textContent = this.tboardArtcl.getArtclNm( artclInfo.artclNo);

                this.node.appendChild(copyNode);
            }
        }

        //searchType1 - ColumnComponent
        ColumnComponent = class {
            constructor(_instance) {
                this.type        = "column";
                this.viewType    = "";
                this.elMng       = tboardMng.elementsInstance;
                this.tboardArtcl = _instance;
                this.comCodeMng  = this.tboardArtcl.tboardInstance.bbsComGrpCd;
                this.node        = undefined;
                

                this.titleNode   = undefined;
                this.newIcon     = undefined;
                this.lockIcon    = undefined;
                this.atchIcon    = undefined;

                this.init()
            }

            init() {
                let searchHtml  = this.elMng.elements.html.search;
                this.newIcon    = searchHtml.querySelector("[class='tboard_list_new']").cloneNode(true);
                this.lockIcon   = searchHtml.querySelector("[class='tboard_icon_locked']").cloneNode(true);
                this.atchIcon   = searchHtml.querySelector("[class='tboard_icon_download']").cloneNode(true);
            }

            append( _artclInfo) {
                let viewType      = _artclInfo.viewType; //searchType1
                let componentType = _artclInfo.cpt;

                //최초한번
                if (!this.node) {    
                    this.node = this.elMng.cloneListColumnFld(viewType, "root");;
                }

                //노드 생성
                this[ componentType ]( _artclInfo );
            }

            addAlignCladd(_node, _type) {
                _node.className = "";
                if ("c" === _type.toLowerCase()) {
                    _node.classList.add("tboard_list_cell_center");
                }
                else if ("r" === _type.toLowerCase()) {
                    _node.classList.add("tboard_list_cell_right");
                }
                else {
                    _node.classList.add("tboard_list_cell_normal");
                }
            }

            //일반텍스트
            defaultType1( artclInfo ) {
                //노드 복사
                let copyNode = this.elMng.cloneListColumnFld(artclInfo.viewType, "defaultType1");
                
                this.artclNm     = this.tboardArtcl.getArtclNm( artclInfo.artclNo); //항목명
                this.indctYn     = this.tboardArtcl.getIndctYn( artclInfo.artclNo); //표시여부

                 //항목번호
                copyNode.dataset.tboardArtclNo = artclInfo.artclNo;
                
                //정렬
                this.addAlignCladd(copyNode, artclInfo.align || "");

                //모바일타이틀                
                copyNode.querySelector(`[class="tboard_list_item_title"]`).textContent = this.artclNm;

                this.node.appendChild(copyNode);
            }
            
            //제목으로 사용 할 항목
            titleType1( artclInfo ) {
                //노드 복사
                let copyNode = this.elMng.cloneListColumnFld(artclInfo.viewType, "titleType1");
                
                this.artclNm     = this.tboardArtcl.getArtclNm( artclInfo.artclNo); //항목명
                this.indctYn     = this.tboardArtcl.getIndctYn( artclInfo.artclNo); //표시여부

                 //항목번호
                copyNode.dataset.tboardArtclNo = artclInfo.artclNo;
                
                //정렬
                this.addAlignCladd(copyNode, artclInfo.align || "");

                //모바일타이틀                
                copyNode.querySelector(`[class="tboard_list_item_title"]`).textContent = this.artclNm;

                this.node.appendChild(copyNode);
            }

            //첨부로 사용 할 항목
            atchType1( artclInfo ) {
                //노드 복사
                let copyNode = this.elMng.cloneListColumnFld(artclInfo.viewType, "atchType1");
                
                this.artclNm     = this.tboardArtcl.getArtclNm( artclInfo.artclNo); //항목명
                this.indctYn     = this.tboardArtcl.getIndctYn( artclInfo.artclNo); //표시여부

                 //항목번호
                copyNode.dataset.tboardArtclNo = artclInfo.artclNo;
                
                //정렬
                this.addAlignCladd(copyNode, artclInfo.align || "");

                //모바일타이틀                
                copyNode.querySelector(`[class="tboard_list_item_title"]`).textContent = this.artclNm;

                this.node.appendChild(copyNode);
            }

        }

        SearchCndComponent = class {
            static instanceMap = {};
            constructor(_instance, _ctlInfo) {
                this.elMng       = tboardMng.elementsInstance;

                this.tboardArtcl = _instance;
                this.comCodeMng  = this.tboardArtcl.tboardInstance.bbsComGrpCd;

                this.artclInfo   = this.tboardArtcl.user.info[ _ctlInfo.artclNo ]; //항목정보
                this.artclNm     = this.tboardArtcl.getArtclNm( _ctlInfo.artclNo); //항목명
                this.indctYn     = this.tboardArtcl.getIndctYn( _ctlInfo.artclNo); //표시여부
                this.ctlInfo     = _ctlInfo; //제어정보
                this.type        = this.ctlInfo.cpt;
                
                //초기화
                this.artclNo     = this.artclNo || {};
                this.artclNo[_ctlInfo.artclNo] = ""; //항목번호

                //
                this.node      = undefined; //노드
                this.labelNode = undefined; //라벨노드

                if (this.indctYn === "N") {
                    return;
                }


                //this.tboardArtcl.idMap.search[_ctlInfo.artclNo] = _ctlInfo.cmpKey;

                //search_defaultType1 만 복수 정보
                if ("defaultType1" === _ctlInfo.cmpKey) {
                    if (this.tboardArtcl.SearchCndComponent.instanceMap[ _ctlInfo.cmpKey ]) {
                        let obj = this.tboardArtcl.SearchCndComponent.instanceMap[ _ctlInfo.cmpKey ];
                        
                        //항목번호
                        obj.artclNo = obj.artclNo || {};
                        obj.artclNo[_ctlInfo.artclNo] = "";
                        this.node = obj.node;
                        
                        this.create();

                        return obj;
                    }

                    this.tboardArtcl.SearchCndComponent.instanceMap[ _ctlInfo.cmpKey ] = this;
                }
                
                this.create();
            }

            create() {
                let componentType = this.ctlInfo.cpt;
                if (typeof this[ componentType ] !== "function") {
                    return;
                }

                //tboard_search_item 생성
                if ("defaultType1" !== componentType) {
                    let viewType = this.ctlInfo.viewType;
                    this.node = this.elMng.cloneSrchFld(viewType, componentType);
                    this.labelNode = this.node.querySelector("[class='tboard_search_label']");
                    this.labelNode.textContent = this.artclNm;
                }

                //노드 생성
                this[ componentType ]();
            }

            getData() {

                let rtnDatas = [];
                let itemNode = this.node.querySelector("[class='tboard_search_item']");
                
                if (this.type === "defaultType1") {
                    let selectNode = itemNode.querySelector("select");
                    let optionNode = itemNode.querySelector("select").querySelectorAll("option");
                    let inputNode  = itemNode.querySelector("input");

                    //
                    let index   = selectNode.selectedIndex;
                    let artclNo = selectNode.options[index].dataset.tboardArtclNo; //선택 한 항목번호
                    let value   = inputNode.value || "";
                    
                    if (artclNo.toLowerCase() === "all") { //전체
                        Array.from(optionNode).forEach( _node => {
                            let rtnData = {
                                artclNo: ""
                                , artclInptCn: ""
                                , cndSeCd: "02" //OR 조건
                            };

                            let chkArtclNo = _node.dataset.tboardArtclNo;
                            if (chkArtclNo.toLowerCase() !== "all") { //all제외
                                rtnData.artclNo     = chkArtclNo;
                                rtnData.artclInptCn = inputNode.value;
                                rtnDatas.push(rtnData);
                            }
                        });
                    }
                    else {
                        let rtnData = {
                            artclNo: artclNo
                            , artclInptCn: value
                            , cndSeCd: "02" //OR 조건
                        };
                        rtnDatas.push(rtnData);
                    }
                }
                else if (this.type === "inputType1") {
                    let inputNode  = itemNode.querySelector("input");
                    let artclNo = inputNode.dataset.tboardArtclNo; //항목번호
                    let value   = inputNode.value || "";
                    
                    let rtnData = {
                        artclNo: artclNo
                        , artclInptCn: value
                        , cndSeCd: "01" //AND 조건
                    };
                    rtnDatas.push(rtnData);
                }
                else if (this.type === "selectType1") {
                    let selectNode  = itemNode.querySelector("select");
                    let artclNo = selectNode.dataset.tboardArtclNo; //항목번호
                    let index   = selectNode.selectedIndex;
                    let value   = selectNode.options[index].value || "";

                    let rtnData = {
                        artclNo: artclNo
                        , artclInptCn: value
                        , cndSeCd: "01" //AND 조건
                    };
                    rtnDatas.push(rtnData);
                }

                else if(this.type === "checkType1") {
                    let artclNo = itemNode.querySelector("[data-tboard-artcl-no]").dataset.tboardArtclNo; //항목번호
                    let chekedData = Array.from(itemNode.querySelectorAll(`input[name="${this.ctlInfo.artclNo}"]:checked`))
                                     .map(checkbox => checkbox.value)
                                     .join('|') || "";

                    let elLength = Array.from(itemNode.querySelectorAll(`input[name="${this.ctlInfo.artclNo}"]`)).length;
                    if (elLength === chekedData.split("|").length) {
                        chekedData = "all";
                    }

                    let rtnData = {
                        artclNo: artclNo
                        , artclInptCn: chekedData
                        , cndSeCd: "01" //AND 조건
                    };
                    rtnDatas.push(rtnData);
                }
                else if(this.type === "radioType1") {
                    let artclNo = itemNode.querySelector("[data-tboard-artcl-no]").dataset.tboardArtclNo; //항목번호
                    let checkedValue = "";
                    let procNode = this.node.querySelector(`input[name="${this.ctlInfo.artclNo}"]:checked`);
                    if (procNode) {
                        checkedValue = procNode.value;
                    }
                    let rtnData = {
                        artclNo: artclNo
                        , artclInptCn: checkedValue || ""
                        , cndSeCd: "01" //AND 조건
                    };
                  
                    rtnDatas.push(rtnData);
                }
                else if(this.type === "dateType1") {
                    let inputNode  = itemNode.querySelector("input");
                    let artclNo = inputNode.dataset.tboardArtclNo; //항목번호
                    let value   = inputNode.value || "";

                    let rtnData = {
                        artclNo: artclNo
                        , artclInptCn: value.replace(/-/g, "")
                        , cndSeCd: "01" //AND 조건
                    };
                    rtnDatas.push(rtnData);
                }
                else if(this.type === "dateperiodType1") {
                    let artclNo = itemNode.querySelector("[data-tboard-artcl-no]").dataset.tboardArtclNo; //항목번호
                    let beginDate = this.node.querySelector(`[data-tboard-id="beign"]`).value || ""; 
                    let endData   = this.node.querySelector(`[data-tboard-id="end"]`).value || "";
                    beginDate = beginDate.replace(/-/g, "");
                    endData   = endData.replace(/-/g, "");
                    
                    let rtnData = {
                        artclNo: artclNo
                        , artclInptCn: beginDate + "|" + endData
                        , cndSeCd: "01" //AND 조건
                    };
                    rtnDatas.push(rtnData);
                }

                return rtnDatas;

            }

            setFocus() {
                let itemNode = this.node.querySelector("[class='tboard_search_item']");
                if (this.type === "defaultType1") {
                    let inputNode  = itemNode.querySelector("input");
                    inputNode.focus();
                }
                else if (this.type === "inputType1") {

                }
                else if (this.type === "selectType1") {

                }
                else if (this.type === "radioType1") {

                }
                else if (this.type === "checkType1") {

                }
                else if (this.type === "dateType1") {

                }
                else if (this.type === "dateperiodType1") {

                }
            }

            
            setData() {

            }

            //기본객체(제목,내용 셀렉트, input)
            defaultType1() {
                let viewType = this.ctlInfo.viewType;
                let option = document.createElement("option");
                
                option.dataset.tboardArtclNo = this.ctlInfo.artclNo; //항목번호
                option.textContent  = this.artclNm;                  //명칭

                if (this.node) {//이미 있으면
                    //select node 찾아서 옵션 추가
                    let selectNode = this.node.querySelector("select");
                    selectNode.appendChild(option);
                }
                else if (!this.node) {
                    //노드 복사
                    this.node = this.elMng.cloneSrchFld(viewType, "defaultType1");

                    //select node 찾아서 옵션 추가
                    let selectNode = this.node.querySelector("select");

                    //option 삭제
                    while(selectNode.firstChild) {
                        selectNode.removeChild(selectNode.firstChild);
                    }
                    let firstOption = document.createElement("option");
                    if (this.ctlInfo.all === "Y") {
                        firstOption.dataset.tboardArtclNo = "all"; //항목번호
                        firstOption.textContent  = "전체";
                    }/* else {
                        firstOption.dataset.tboardArtclNo = "sel"; //항목번호
                        firstOption.textContent  = "선택";
                    }*/
                    //첫라인 옵션
                    selectNode.appendChild(firstOption);

                    //옵션추가
                    selectNode.appendChild(option);
                }
            }

            //인풋
            inputType1() {                
                this.node.querySelector("input").dataset.tboardArtclNo = this.ctlInfo.artclNo;
            }
            
            //select
            selectType1() {

                //select node 찾아서 옵션 추가
                let selectNode = this.node.querySelector("select");
                selectNode.dataset.tboardArtclNo = this.ctlInfo.artclNo;

                //option 삭제
                while(selectNode.firstChild) {
                    selectNode.removeChild(selectNode.firstChild);
                }
                let firstOption = document.createElement("option");
                if (this.ctlInfo.all === "Y") {
                    firstOption.dataset.tboardArtclNo = "all"; //항목번호
                    firstOption.value = "all";
                    firstOption.textContent  = "전체";
                    
                    //첫라인 옵션
                    selectNode.appendChild(firstOption);
                }/* else {
                    firstOption.dataset.tboardArtclNo = "sel"; //항목번호
                    firstOption.value = "sel";
                    firstOption.textContent  = "선택";
                }*/

                let codeList = this.comCodeMng.getCodeList(this.ctlInfo.cct, this.ctlInfo.src);
                for (const code of codeList) {
                    //옵션추가
                    let option = document.createElement("option");
                    option.value = code.comCd;
                    option.textContent = code.comCdNm;
                    selectNode.appendChild(option);
                }
            }
            
            //radio
            radioType1() {
                //복사
                let tempNode = this.node.querySelector(`[class="tboard_radio"]`).cloneNode(true);

                //option 삭제
                let nodeGrp = this.node.querySelector(`[class="tboard_search_input"]`);
                while(nodeGrp.firstChild) {
                    nodeGrp.removeChild(nodeGrp.firstChild);
                }
                
                //데이터값 만큼 복사/append
                let codeList = this.comCodeMng.getCodeList(this.ctlInfo.cct, this.ctlInfo.src);
                for (const code of codeList) {
                    let copyNode = tempNode.cloneNode(true);
                    copyNode.querySelector("input").value = code.comCd; //코드
                    copyNode.querySelector("span").textContent = code.comCdNm; //코드명
                    copyNode.querySelector("input").name = this.ctlInfo.artclNo;
                    nodeGrp.appendChild(copyNode);
                }

                if (this.ctlInfo.all === "Y") {
                    let copyNode = tempNode.cloneNode(true);
                    copyNode.querySelector("input").value = "all"; //코드
                    copyNode.querySelector("span").textContent = "전체";
                    copyNode.querySelector("input").name = this.ctlInfo.artclNo;
                    nodeGrp.prepend(copyNode);
                }

                nodeGrp.dataset.tboardArtclNo = this.ctlInfo.artclNo;
            }

            //check
            checkType1() {
                //복사
                let tempNode = this.node.querySelector(`[class="tboard_check"]`);

                //option 삭제
                let nodeGrp = this.node.querySelector(`[class="tboard_search_input"]`);
                while(nodeGrp.firstChild) {
                    nodeGrp.removeChild(nodeGrp.firstChild);
                }
                
                //데이터값 만큼 복사/append
                let codeList = this.comCodeMng.getCodeList(this.ctlInfo.cct, this.ctlInfo.src);
                for (const code of codeList) {
                    let copyNode = tempNode.cloneNode(true);
                    copyNode.querySelector("input").value = code.comCd; //코드
                    copyNode.querySelector("span").textContent = code.comCdNm; //코드명
                    copyNode.querySelector("input").name = this.ctlInfo.artclNo;
                    nodeGrp.appendChild(copyNode);
                }

                if (this.ctlInfo.all === "Y") {
                    let copyNode = tempNode.cloneNode(true);
                    copyNode.querySelector("input").value = "all"; //코드
                    copyNode.querySelector("span").textContent = "전체";                    
                    nodeGrp.prepend(copyNode);

                    const allCheckBoxEl = copyNode.querySelector("input");
                    const etcCheckBoxEl = nodeGrp.querySelectorAll(`input[name="${this.ctlInfo.artclNo}"]`);

                    allCheckBoxEl.addEventListener("change", () => {
                        etcCheckBoxEl.forEach(checkEl => {
                            checkEl.checked = allCheckBoxEl.checked;
                        });
                    });

                    etcCheckBoxEl.forEach(checkEl => {
                        checkEl.addEventListener("change", () => {
                            const allChecked  = Array.from(etcCheckBoxEl).every(checkbox => checkbox.checked);
                            const someChecked = Array.from(etcCheckBoxEl).every(checkbox => checkbox.checked);

                            allCheckBoxEl.checked = allChecked;
                            allCheckBoxEl.indeterminate = !allChecked && someChecked;
                        });
                    });
                }

                nodeGrp.dataset.tboardArtclNo = this.ctlInfo.artclNo;
            }
            
            //date
            dateType1() {                
                this.node.querySelector("input").dataset.tboardArtclNo = this.ctlInfo.artclNo;

            }

            //dateperiod
            dateperiodType1() {                
                this.node.querySelector("input").dataset.tboardArtclNo = this.ctlInfo.artclNo;
            }
        }


    },
    TboardComCode = class {
        constructor() {
            this.astGrpCdObj = {};
            this.acmGrpCdObj = {};
            this.astGrpCdList = {};
            this.acmGrpCdList = {};
        }

        initComCodeList(astGrpCd, acmGrpCd) {
            let tempAstGrpCd = astGrpCd || [];
            let tempAcmGrpCd = acmGrpCd || [];

            if (tempAstGrpCd.length > 1) {
                for (const comCode of tempAstGrpCd) {
                    //그룹코드 오브젝트 형
                    this.astGrpCdObj[comCode.comGroupCd] = this.astGrpCdObj[comCode.comGroupCd] || {};
                    this.astGrpCdObj[comCode.comGroupCd][comCode.comCd] = comCode;

                    //그룹코드 리스트 형
                    this.astGrpCdList[comCode.comGroupCd] = this.astGrpCdList[comCode.comGroupCd] || [];
                    this.astGrpCdList[comCode.comGroupCd].push(comCode);
                }
            }

            if (tempAcmGrpCd.length > 1) {
                for (const comCode of tempAcmGrpCd) {
                    //그룹코드 오브젝트 형
                    this.acmGrpCdObj[comCode.comGroupCd] = this.acmGrpCdObj[comCode.comGroupCd] || {};
                    this.acmGrpCdObj[comCode.comGroupCd][comCode.comCd] = comCode;

                    //그룹코드 리스트 형
                    this.acmGrpCdList[comCode.comGroupCd] = this.acmGrpCdList[comCode.comGroupCd] || [];
                    this.acmGrpCdList[comCode.comGroupCd].push(comCode);
                }
            }
        }

        getCodeNm(_type, _grpComCd, _comCd) {
            if (_type === "ast") {
                return this.getAstCodeNm(_grpComCd, _comCd);
            }
            else if (_type === "acm") {
                return this.getAcmCodeNm(_grpComCd, _comCd);
            }
            
        }
        
        getAstCodeNm(grpComCd, comCd) {
            if (!grpComCd || !comCd) {
                return "";
            }
            try {
                return this.astGrpCdObj[grpComCd][comCd].comCdNm || "";
            }
            catch(err) {
                return "";
            }
        }

        getAcmCodeNm(grpComCd, comCd) {
            if (!grpComCd || !comCd) {
                return "";
            }
            try {
                return this.acmGrpCdObj[grpComCd][comCd].comCdNm || "";
            }
            catch(err) {
                return "";
            }
        }

        getCodeList(_type, _grpComCd) {
            if (_type === "ast") {
                return this.getAstCodeList(_grpComCd);
            }
            else if (_type === "acm") {
                return this.getAcmCodeList(_grpComCd);
            }
            
        }
        
        getAstCodeList(grpComCd) {
            if (!grpComCd) {
                return [];
            }
            try {
                return this.astGrpCdList[grpComCd] || [];
            }
            catch(err) {
                return [];
            }
        }

        getAcmCodeList(grpComCd) {
            if (!grpComCd) {
                return [];
            }
            try {
                return this.acmGrpCdList[grpComCd] || [];
            }
            catch(err) {
                return [];
            }
        }
    },

    TboardFunction = class {
        constructor( _instance) {
            this.tboardInstance = _instance;
        }

        async searchPstList() {
            let objTboard  = this.tboardInstance;
            let sortKey    = this.tboardInstance.bbsSort.currentSortKey;
            let cndCmp     = this.tboardInstance.bbsArtcl.cmp.search;
            let inputData  = {};
            let artclData  = [];
            let defaultCnd = {};
            
            //this.tboardInstance.result.search = {}; //초기화
            //this.tboardInstance.result.mergeSearch = {};
            try {

                let isErrFlag = false;
                let objErrChk = {
                    code: ""
                }
                Object.keys(cndCmp).forEach( _key => {
                    if (isErrFlag === true) {
                        return;
                    }

                    //console.log(" search Cnd : ", _key, cndCmp[_key].type);
                    let artclCmp   = cndCmp[_key];                    
                    let isRequired = artclCmp.ctlInfo.req || ""; //필수
                    let length     = artclCmp.ctlInfo.len || -1; //길이수
    
                    let cmpData = artclCmp.getData() || [];
                    //console.log(" search value : ", cmpData);
                    
                    //필수값체크
                    if (isRequired.toUpperCase() === "Y") {
                        if (cmpData.length < 1 && !cmpData[0].artclInptCn) {
                            //필수값
                            isErrFlag = true;
                            objErrChk.code = "";
                            artclCmp.setFocus();
                        }
                    }
                    artclData = [...artclData, ...cmpData];
                });

                //
                if (isErrFlag) {
                    //TODO : 공통알럿 or 표시
                    tboardUtil.commonAlert( tboardMsg.getMsg(objErrChk.code) );
                    return;
                }
            }
            catch(error) {
                console.error(error);
                return;
            }


            //값이 없는 항목은 제외(필수 체크는 위에서)
            let andArtclData = JSON.parse(JSON.stringify(artclData
                .filter(data => {return data.cndSeCd === "01"})
                .filter(data => {
                    //console.log(" ==> ", this.tboardInstance.bbsDfArtcl.get(data.artclNo));
                    //제목,내용,등록자등 일반필드
                    let dataKey = this.tboardInstance.bbsDfArtcl.get(data.artclNo);                    
                    if (dataKey) {
                        dataKey = dataKey.charAt(0).toUpperCase() + dataKey.slice(1);
                        defaultCnd[`and${dataKey}`] = data.artclInptCn;
                        return false;
                    }
                   
                    //값이 있는 것만  
                    if(!data.artclInptCn || data.artclInptCn === "all") {
                        return false;
                    }

                    return true;
                })
            ));

            let orArtclData = JSON.parse(JSON.stringify(artclData
                .filter(data => {return data.cndSeCd === "02"}) //or조건
                .filter(data => {
                    //console.log(" ==> ", this.tboardInstance.bbsDfArtcl.get(data.artclNo));
                    //제목,내용,등록자등 일반필드
                    let dataKey = this.tboardInstance.bbsDfArtcl.get(data.artclNo);                    
                    dataKey = dataKey.charAt(0).toUpperCase() + dataKey.slice(1);
                    if (dataKey) {
                        defaultCnd[`or${dataKey}`] = data.artclInptCn;
                        return false;
                    }
                    return true;
                })
            ));
           

            //입력 파라메터로 받은 조회조건 세팅
            Object.keys(this.tboardInstance.bbsUser.itemInfo || {}).forEach( _itemKey => {
                //조회조건으로 화면에서 사용자가 선택한 항목값이 있으면 해당 값이 우선
                /*if (andArtclData.findIndex(data => andArtclData.artclNo === _itemKey) > -1) {
                    return;
                }*/
                let dataKey = this.tboardInstance.bbsDfArtcl.get(_itemKey);
                let value = this.tboardInstance.bbsUser.itemInfo[_itemKey];
                if (dataKey) {
                    dataKey = dataKey.charAt(0).toUpperCase() + dataKey.slice(1);
                    defaultCnd[`and${dataKey}`] = value;
                    return false;
                }

                let itemInfo = {
                    cndSeCd : "01"
                    , artclNo : _itemKey
                    , artclInptCn : value
                }
                andArtclData.push(itemInfo);
            });

            //artclData
            defaultCnd.curPageCo    = objTboard.bbsPaging.curPageCo;
            defaultCnd.recodePageCo = objTboard.bbsPaging.recordPageCo;
            defaultCnd.pstSeCd      = "1200001";
            
            //첨부
            defaultCnd.atcflCntSrchYn = "N";
            if (Object.keys(this.tboardInstance.bbsArtcl.user.ctl.list.control["D080100001"] || {}).length > 0) {
                defaultCnd.atcflCntSrchYn = "Y";                
            }

            //리스트에서 사용할 항목
            defaultCnd.artclNoList = [];
            defaultCnd[sortKey] = "Y"; //정렬키
            if (sortKey === "pstNmOrder") {
                defaultCnd.isDesc   = ""; //정렬 ASC
            }
            else {
                defaultCnd.isDesc   = "Y"; //정렬 DESC
            }

            defaultCnd.isAddPstCn = "N";
            if (this.tboardInstance.bbsAuth.isFaqType()) {
                defaultCnd.isAddPstCn = "Y";
            }               

            //trim
            Object.keys(defaultCnd).forEach( _key => {
                if (typeof defaultCnd[_key] === "string") {
                    defaultCnd[_key] = (defaultCnd[_key] || "").trim();
                }
            });

            //trim
            for(let data of [...andArtclData, ...orArtclData]) {
                data.artclInptCn = (data.artclInptCn || "").trim();
            }

            //기본조건
            inputData.searchDefaultCndGrid = [defaultCnd];
            //항목조건
            inputData.searchArtclCndGrid = [...andArtclData, ...orArtclData];

            //1. 게시글 조회
            let pstList = await this.tboardInstance.SERVICE.basicAccess(inputData);
            let data = { 
                totalCnt: pstList.response.totalCnt || "0"
                , totalNormalCnt: pstList.response.totalNormalCnt || "0"
                , totalNoticeCnt: pstList.response.totalNoticeCnt || "0"
                , baseList: pstList.response.pstNoGrid || []
                , artclInfo : pstList.response.artclValueGrid || []
                , pstList: pstList.response.bbsPstGrid || []
                , atchList: pstList.response.atcflArtclGrid || []
                , thumbList: pstList.response.thumbGrid || []
                , fileList: pstList.response.fileGrid || []
            };

            this.isSearchFlag = true;
            return data;
        }

        //데이터만조회
        async searchReplyDetail(_objPst) {
            try {

                if (!_objPst.pstNo) {
                    throw new Error("pstNo empty");
                }

                //1. 상세 정보 요청
                let inputData = {pstDefaultGrid: []};
                let inputParam = {
                    bbsId : _objPst.bbsId
                    , pstGroupNo : _objPst.pstNo
                };

                inputData.pstDefaultGrid.push(inputParam);
                //console.log("searchReplyDetail st");
                //게시판 상세 조회
                let result = await this.tboardInstance.SERVICE.replyRead(inputData); //게시판상세
                //console.log("searchReplyDetail re");
                if (result.code !== 0) {
                    let msgCode = result.subMessage || "msg_903";
                    throw new Error("detail error : " + tboardMsg.getMsg(msgCode));
                }

                if (!Array.isArray(result.response?.bbsDetailInfo)) {
                    let msgCode = result.subMessage || "msg_903";
                    //console.log("조회 된 데이터가 없습니다.");
                    throw new Error("detail error : " + tboardMsg.getMsg(msgCode));    
                }

                //데이터 세팅
                let datas = {};
                datas.pstInfo     = result.response.bbsDetailInfo[0];//게시물
                datas.atcflInfo   = result.response.atcflGrid || [];//첨부

                //항목데이터
                let artclData   = {};
                for (const objArtcl of (result.response.artclValueGrid || [])) {
                    artclData[objArtcl.artclNo] = objArtcl;
                }
                datas.artclInfo = artclData;
                datas.reply = true;
                return datas;
            } catch (error) {  
                throw new Error(error);
            }
        }


        //데이터만조회
        async searchDetail(_objPst) {
            try {

                if (!_objPst.pstNo) {
                    throw new Error("pstNo empty");
                }

                //이전,다음정보
                let movePstInfo = await this.tboardInstance.getPrevAndNextPstNo(_objPst.pstNo);

                //1. 상세 정보 요청
                let inputData = {pstDefaultGrid: []};
                let inputParam = {
                    bbsId : _objPst.bbsId
                    , pstNo : _objPst.pstNo
                };
                inputData.pstDefaultGrid.push(inputParam);

                //게시판 상세 조회
                //console.log("searchDetail st");
                let result = await this.tboardInstance.SERVICE.basicRead(inputData); //게시판상세
                //console.log("searchDetail re");
                if (result.code !== 0) {
                    let msgCode = result.subMessage || "msg_903";
                    throw new Error("detail error : " + tboardMsg.getMsg(msgCode));
                }

                if (!Array.isArray(result.response?.bbsDetailInfo) || result.response.bbsDetailInfo.length < 1) {
                    let msgCode = result.subMessage || "msg_903";
                    //console.log("조회 된 데이터가 없습니다.");
                    throw new Error("detail error : " + tboardMsg.getMsg(msgCode));    
                }

                //데이터 세팅
                let datas = {};
                datas.pstInfo = result.response.bbsDetailInfo[0];//게시물
                datas.atcflInfo = result.response.atcflGrid || [];//첨부
                datas.movePstInfo = movePstInfo || {}//이동                
                //항목데이터
                let artclData   = {};
                for (const objArtcl of (result.response.artclValueGrid || [])) {
                    artclData[objArtcl.artclNo] = objArtcl;
                }
                datas.artclInfo = artclData;
                datas.default = true;
                return datas;
            } catch (error) {
                throw new Error(error);
            }
        }

        async deletePst(_data) {
            let objErrChk = {
                isErr: false
                , code: ""
                , msg: ""
            };

            try {
                if (this.tboardInstance.isDeleteProgress) {
                    return;
                }
                this.tboardInstance.isDeleteProgress = true;

                if (!_data || !_data.pstNo) {
                    objErrChk.msg = "msg_912";
                    throw new Error(tboardMsg.getMsg(objErrChk.msg));
                }
                
                //삭제
                let inputData = {pstDefaultGrid: []};
                let inputParam = {
                    bbsId : _data.bbsId
                    , pstNo : _data.pstNo
                };
                inputData.pstDefaultGrid.push(inputParam);
                let result = await this.tboardInstance.SERVICE.basicDelete(inputData);
            }
            catch(error) {                
                //tboardUtil.commonAlert( tboardMsg.getMsg(objErrChk.code) );
                //alert (tboardMsg.getMsg(objErrChk.msg || "msg_910"));
                console.error(error);
                objErrChk.isErr = true;
            }
            finally {
                this.tboardInstance.isDeleteProgress = false; 
                let inputData = {};
                inputData.searchType = "list";
                this.tboardInstance.bbsEvent.openSavedView(inputData);
            }
        }


        async savePst(_data) {
            let pstNo = "";
            let isError = false;

            try {
                if (this.tboardInstance.isSaveProgress) {
                    return;
                }

                this.tboardInstance.isSaveProgress = true;
                let objTboard  = this.tboardInstance;
                let writeCmps  = this.tboardInstance.bbsArtcl.cmp.write.artcl;
                
                let inputData = {
                    formData: null
                    , input: {
                        pstWriteGrid:[] //게시물기본그리드
                        , artclWriteGrid: [] //게시물항목
                    }
                };
                
                let objPstWriteGrid   = {};//게시물기본
                let arrArtclWriteGrid = [];
                let arrThumbWriteGrid = [];
                let formData  = new FormData();
                let isErrFlag = false;
                let objErrChk = {
                    isErr: false
                    , code: ""
                    , msg: ""
                }

                //컴포넌트 수만큼
                Object.keys(writeCmps).forEach( _key => {
                    if (objErrChk.isErr === true) {
                        return;
                    }

                    //console.log(" writeCmps : ", _key, writeCmps[_key].type);
                    let component  = writeCmps[_key];

                    let isRequired = component.ctlInfo.req || ""; //필수
                    let length     = component.ctlInfo.len || -1; //길이수
                    let artclNo    = component.ctlInfo.artclNo;
                    let artclKrNm  = objTboard.bbsArtcl.getArtclNm(artclNo);

                    let objData = component.getData() || []; //
                    //console.log("   objData : ", objData);

                    //필수값체크
                    if (isRequired.toUpperCase() === "Y") {
                        if (!objData.data) {
                            //필수값
                            objErrChk.isErr = true;
                            objErrChk.code  = "msg_907";
                            objErrChk.msg   = tboardMsg.getMsg(objErrChk.code, [artclKrNm]);
                            component.setFocus();
                            return;
                        }
                    }

                    //제목,내용,등록자등 일반필드
                    let dataKey = this.tboardInstance.bbsDfArtcl.get( artclNo );
                    //console.log("wirte dataKey : ", dataKey);

                    if (component.subType === "thumb") {
                        //파일추가
                       arrThumbWriteGrid = arrThumbWriteGrid || [];
                        //파일추가
                        Object.keys(objData.data).forEach( _key => {
                            objData.data[_key].artclNo = artclNo;
                            arrThumbWriteGrid.push(objData.data[_key]);
                        });
                        //arrThumbWriteGrid = [...arrThumbWriteGrid, ...objData.data];

                       //삭제파일
                       objPstWriteGrid.delFiles = objPstWriteGrid.delFiles ||[];//초기화
                       objPstWriteGrid.delFiles = [...objPstWriteGrid.delFiles, ...objData.delFiles];
                    }
                    else if (this.tboardInstance.bbsDfArtcl.isAtchArtcl(artclNo)) {
                         //파일추가
                        Object.keys(objData.data).forEach( _key => {
                            formData.append(artclNo,  objData.data[_key]);
                        });

                        //삭제파일
                        objPstWriteGrid.delFiles = objPstWriteGrid.delFiles ||[];//초기화
                        objPstWriteGrid.delFiles = [...objPstWriteGrid.delFiles, ...objData.delFiles];
                    }
                    else if (component.subType === "notice") {
                        objPstWriteGrid.pstSeCd    = objData.data.pstSeCd;
                        objPstWriteGrid.pstSortSeq = objData.data.pstSortSeq;
                    }
                    else if (component.subType === "secret") {                        
                        objPstWriteGrid.rlsYn = objData.data;
                    }
                    //기본항목
                    else if (dataKey) { //기본값
                        objPstWriteGrid[dataKey] = objData.data;
                    }
                    //동적항목
                    else {                        
                        objData.artclInptCn = objData.data;
                        arrArtclWriteGrid   = arrArtclWriteGrid || [];
                        arrArtclWriteGrid.push(objData);
                    }
                });

                //에러시
                if (objErrChk.isErr) {
                    //TODO : 공통알럿 or 표시                    
                    tboardUtil.commonAlert(objErrChk.msg);
                    isError = true;
                    return;
                }

                if (_data.isWriteMode === true) {                    
                    objPstWriteGrid.pstNo    = "";
                }
                else {
                    objPstWriteGrid.pstNo    = _data.pstInfo.pstNo;
                    objPstWriteGrid.delFiles = JSON.stringify(objPstWriteGrid.delFiles);                    
                }

                //파일
                inputData.formData = formData;
                inputData.input.pstWriteGrid.push(objPstWriteGrid);
                inputData.input.artclWriteGrid    = arrArtclWriteGrid;
                inputData.input.arrThumbWriteGrid = arrThumbWriteGrid;
    
                //console.log("====================basicWrite");
                //console.log(inputData);
                //console.log("====================basicWrite");
                
                let result = await this.tboardInstance.SERVICE.basicWrite(inputData);
                if (result.code !== 0) {

                    let msgCode = _data.isWriteMode ? "msg_906" : "msg_909";
                    throw new Error("write error : " + tboardMsg.getMsg(msgCode));
                }

                //등록, 수정게시물번호
                pstNo = result.response.writeResultGrid[0].pstNo;
                if (!pstNo) {
                    let msgCode =  _data.isWriteMode ? "msg_906" : "msg_909";
                    throw new Error("write error : " + tboardMsg.getMsg(msgCode));
                }
            }
            catch(error) {
                console.error(error);
                isError = true;
                return;
            }
            finally {
                this.tboardInstance.result.write.pstNo = pstNo;
                this.tboardInstance.isSaveProgress = false; 
                if (isError === false) {
                    let inputData = {};
                    inputData.searchType = "detail";
                    inputData.data = {pstNo: pstNo};
                    this.tboardInstance.bbsEvent.openSavedView(inputData);
                }
            }
        }

        //replyWrite.tx
        async saveReplyPst(_data) {
            let pstNo = "";
            let isError = false;

            //_data.isWriteMode
            try {
                if (this.tboardInstance.isSaveProgress) {
                    return;
                }
                this.tboardInstance.isSaveProgress = true;
                let objTboard  = this.tboardInstance;
                let writeCmps  = this.tboardInstance.bbsArtcl.cmp.writeReply.artcl;
                
                let inputData = {
                    formData: null
                    , input: {
                        pstWriteGrid:[] //게시물기본그리드
                        , artclWriteGrid: [] //게시물항목
                    }
                };
                
                let objPstWriteGrid   = {};//게시물기본
                let arrArtclWriteGrid = [];
                let formData  = new FormData();
                let objErrChk = {
                    isErr: false
                    , code: ""
                    , msg: ""
                }


                //컴포넌트 수만큼
                Object.keys(writeCmps).forEach( _key => {
                    if (objErrChk.isErr === true) {
                        return;
                    }
                    //console.log(" writeCmps : ", _key, writeCmps[_key].type);
                    let component  = writeCmps[_key];
                    let isRequired = component.ctlInfo.req || ""; //필수
                    let length     = component.ctlInfo.len || -1; //길이수
                    let artclNo    = component.ctlInfo.artclNo;
                    let artclKrNm  = objTboard.bbsArtcl.getArtclNm(artclNo);

                    let objData = component.getData() || []; //
                    //console.log("   objData : ", objData);

                    //필수값체크
                    if (isRequired.toUpperCase() === "Y") {
                        if (!objData.data) {
                            //필수값
                            objErrChk.isErr = true;
                            objErrChk.code  = "msg_907";
                            objErrChk.msg   = tboardMsg.getMsg(objErrChk.code, [artclKrNm]);
                            component.setFocus();
                            return;
                        }
                    }

                    //제목,내용,등록자등 일반필드
                    let dataKey = this.tboardInstance.bbsDfArtcl.get( artclNo );
                    //console.log("wirte dataKey : ", dataKey);

                    if (this.tboardInstance.bbsDfArtcl.isAtchArtcl(artclNo)) {
                         //파일추가
                        Object.keys(objData.data).forEach( _key => {
                            formData.append(artclNo,  objData.data[_key]);
                        });

                        //삭제파일
                        objPstWriteGrid.delFiles = objPstWriteGrid.delFiles ||[];//초기화
                        objPstWriteGrid.delFiles = [...objPstWriteGrid.delFiles, ...objData.delFiles];
                    }
                    else if (component.subType === "notice") {
                        objPstWriteGrid.pstSeCd    = objData.data.pstSeCd;
                        objPstWriteGrid.pstSortSeq = objData.data.pstSortSeq;
                    }
                    else if (component.subType === "secret") {                        
                        objPstWriteGrid.rlsYn = objData.data;
                    }
                    //기본항목
                    else if (dataKey) { //기본값
                        objPstWriteGrid[dataKey] = objData.data;
                    }
                    //동적항목
                    else {                        
                        objData.artclInptCn = objData.data;
                        arrArtclWriteGrid   = arrArtclWriteGrid || [];
                        arrArtclWriteGrid.push(objData);
                    }
                });

                //에러시
                if (objErrChk.isErr) {
                    //TODO : 공통알럿 or 표시                    
                    tboardUtil.commonAlert(objErrChk.msg);
                    isError = true;
                    return;
                }

                objPstWriteGrid.orgnPstNo = "";
                objPstWriteGrid.prntPstNo = "";
                if (_data.isWriteMode === true) {
                    objPstWriteGrid.orgnPstNo = _data.pstInfo.orgnPstNo;
                    objPstWriteGrid.prntPstNo = _data.pstInfo.prntPstNo;
                    objPstWriteGrid.pstNo     = "";
                } 
                else {
                    objPstWriteGrid.prntPstNo = "";
                    objPstWriteGrid.pstNo     = _data.pstInfo.pstNo;
                    objPstWriteGrid.delFiles  = JSON.stringify(objPstWriteGrid.delFiles);
                    //inputData.input.reqId    = "replyEdit";
                }

                //파일
                inputData.formData = formData;
                inputData.input.pstWriteGrid.push(objPstWriteGrid);
                inputData.input.artclWriteGrid = arrArtclWriteGrid;
    
                //console.log("====================replyWrite");
                //console.log(inputData);
                //console.log("====================replyWrite");
                
                let result = await this.tboardInstance.SERVICE.replyWrite(inputData);
                if (result.code !== 0) {

                    let msgCode = _data.isWriteMode ? "msg_906" : "msg_909";
                    throw new Error("write error : " + tboardMsg.getMsg(msgCode));
                }

                //등록, 수정게시물번호
                pstNo = result.response.writeResultGrid[0].pstNo;
                if (!pstNo) {
                    let msgCode = _data.isWriteMode ? "msg_906" : "msg_909";
                    throw new Error("write error : " + tboardMsg.getMsg(msgCode));
                }
            }
            catch(error) {
                console.error(error);
                isError = true;
                return;
            }
            finally {
                this.tboardInstance.result.write.pstNo = pstNo;
                this.tboardInstance.isSaveProgress = false; 
                if (isError === false) {
                    
                    let inputData = {};
                    inputData.searchType = "detail";
                    inputData.data = {};
                    inputData.data.orgnPstNo = _data.pstInfo.orgnPstNo;
                    inputData.data.pstNo = pstNo;

                    this.tboardInstance.bbsEvent.openSavedView(inputData);
                }
            }
        }

        async deleteReplyPst(_data) {
            let objErrChk = {
                isErr: false
                , code: ""
                , msg: ""
            };

            try {
                if (this.tboardInstance.isDeleteProgress) {
                    return;
                }
                this.tboardInstance.isDeleteProgress = true;

                if (!_data || !_data.pstNo) {
                    objErrChk.msg = "msg_912";
                    throw new Error(tboardMsg.getMsg(objErrChk.msg));
                }

                //삭제
                let inputData = {pstDefaultGrid: []};
                let inputParam = {
                    bbsId : _data.bbsId
                    , pstNo : _data.pstNo
                };
                inputData.pstDefaultGrid.push(inputParam);
                await this.tboardInstance.SERVICE.replyDelete(inputData);
            }
            catch(error) {                
                //alert (tboardMsg.getMsg(objErrChk.msg || "msg_910"));
                console.error(error);
                objErrChk.isErr = true;
            }
            finally {
                this.tboardInstance.isDeleteProgress = false;

                let inputData = {};
                inputData.searchType = "detail";
                inputData.data = {};
                inputData.data.pstNo = _data.pstNo;
                inputData.data.orgnPstNo = _data.orgnPstNo;

                this.tboardInstance.bbsEvent.openSavedView(inputData);
            }
        }

        getImageFromBase64(_args) {
            let authKey = _args.authKey;
            let chkAuth = this.tboardInstance.bbsAuth.chkAuth(authKey);
            if (chkAuth.isAuth === false) {
                return;
            }
            
            //let thumbList = _args.data || [];
            //let inputData = {thumbInfo: thumbList, scb: _args.scb};
            this.tboardInstance.SERVICE.getImageFromBase64(_args);
        }

    },

    TboardEvent = class {
        constructor( _instance) {
            this.tboardInstance = _instance;
        }

        addDefaultEvent() {
            let searchNode  = this.tboardInstance.view.search;
            
            //조회화면 - 조회 버튼
            let searchBtn = searchNode.querySelector(`[class="tboard_search_buttons"]`).querySelector("button");
            let writeBtn  = searchNode.querySelector(`[class="tboard_footer_buttons"]`).querySelector("a");
            
            //조회이벤트
            if (searchBtn) {
                searchBtn.addEventListener("click", () => {
                    this.tboardInstance.bbsPaging.initPageCo();
                    this.search();
                });
            }

            //등록이벤트
            if (writeBtn) {
                if (this.tboardInstance.bbsAuth.isBasicWrite() === false) {
                    writeBtn.remove();
                    return;
                }
                writeBtn.addEventListener("click", () => {
                    let args = {
                        key: "basicWrite.view"
                        , data: {isWriteMode: true}
                    };
                    this.handleEvent(args);
                    //this.writeView (this, 1);
                });
            }

            //정렬순서
            for (const _key in this.tboardInstance.bbsSort.node.sort) {
                let sortNode = this.tboardInstance.bbsSort.node.sort[ _key ];
                sortNode.addEventListener("click", () => { //화살표함수. this(tboardEvent)
                    this.tboardInstance.bbsSort.setCurrent(sortNode);
                    this.tboardInstance.bbsPaging.initPageCo();
                    this.search.call(this);
                });
            }
        }

        //데이터만조회
        async searchData() {
            //1. 게시글 조회
            let pstList = await this.handleEvent({key: "basicAccess.tx", data: {}});

            //게시물 조회 정보(백업)
            this.tboardInstance.result.mergeSearch.baseList = [...this.tboardInstance.result.mergeSearch.baseList, ...pstList.baseList];
            this.tboardInstance.result.mergeSearch.pstList  = [...this.tboardInstance.result.mergeSearch.pstList, ...pstList.pstList];

            return pstList;
        }

        //조회 이벤트
        async search() {
            let pstList = await this.handleEvent({key: "basicAccess.tx", data: {}});
            //console.log("pstList", pstList);
            this.tboardInstance.renderView("list", pstList);

            //게시물 조회 정보(백업)
            this.tboardInstance.result.search = pstList;
            this.tboardInstance.result.mergeSearch = pstList;
        }


        searchBkView() {
            this.tboardInstance.renderView("search.cnd");
            this.tboardInstance.renderView("list");
            this.tboardInstance.renderView("search.etc");
            this.search();
        }

        //
        async detailViewDefault(_objPst) {

            let promiseFnArr = [];
            let detailPst = this.tboardInstance.bbsFn.searchDetail(_objPst);
            let replyPst  = null;
            if (this.tboardInstance.bbsAuth.isReplyRead()) {
                replyPst = this.tboardInstance.bbsFn.searchReplyDetail(_objPst);
                promiseFnArr.push(replyPst);
            }
            promiseFnArr.push(detailPst);

            Promise.allSettled(promiseFnArr)
            .then((results, index) => {
                //1. 데이터조회결과
                let pstAllInfo   = {};
                let replyAllInfo = {};       
                results.forEach( result => {
                    if (result.status !== "fulfilled") {
                        throw new Error(result.reason);
                    }
                    if (result.value.default) {
                        pstAllInfo = result.value;
                    }
                    else {
                        replyAllInfo = result.value;
                    }
                });

                //2. 게시판 상세 정보 렌더링
                this.tboardInstance.renderView(this.tboardInstance.viewType.detail, pstAllInfo);

                //2. 게시판 상세(답변) 정보 렌더링
                replyAllInfo.orgnPstInfo = pstAllInfo.pstInfo;
                this.tboardInstance.renderView(this.tboardInstance.viewType.reply, replyAllInfo);

                let btnWrapEl = this.tboardInstance.view.detail.querySelector(`[class="tboard_footer_buttons"]`);
                while(btnWrapEl.firstChild) {
                    btnWrapEl.firstChild.remove();
                }

                let btnReplyDel = null;
                let btnReplySave = null;
                let btnDel = null;
                let btnEdit = null;
                let btnList = null;
                let viewType = this.tboardInstance.viewType.detail;
                if (replyAllInfo.pstInfo) {
                    //원글 게시물번호
                    replyAllInfo.pstInfo.orgnPstNo = replyAllInfo.orgnPstInfo.pstNo;

                    //답변 글 삭제
                    if (this.tboardInstance.bbsAuth.isShowBtnReplyDelete()) {
                        btnReplyDel = tboardMng.elements[viewType].etcFld.btnReplyDel.cloneNode(true);
                        btnReplyDel.addEventListener("click", () => {
                            let inputData = replyAllInfo.pstInfo;
                            let args = {
                                key: "replyDelete.tx"
                                , data: inputData
                            };
                            this.handleEvent(args);
                        });
                    }

                    //답변 글 수정화면
                    if (this.tboardInstance.bbsAuth.isShowBtnReplyEdit()) {
                        btnReplySave = tboardMng.elements[viewType].etcFld.btnReplySave.cloneNode(true);
                        btnReplySave.addEventListener("click", () => {
                            let inputData = {};
                            /*inputData.pstInfo = {
                                pstNo : pstAllInfo.pstInfo.pstNo                                    
                            }
                            inputData.orgnPstInfo = pstAllInfo; */
                            
                            inputData = replyAllInfo;
                            inputData.orgnPstInfo = pstAllInfo
                            inputData.isWriteMode = false;

                            let args = {
                                key: "replyWrite.view"
                                , data: inputData
                            };
                            this.handleEvent(args);
                        });
                        btnReplySave.textContent = "답글수정";
                    }
                }
                else {
                    //답변 글 등록화면
                    if (this.tboardInstance.bbsAuth.isShowBtnReplyWrite()) {
                        btnReplySave = tboardMng.elements[viewType].etcFld.btnReplySave.cloneNode(true);
                        btnReplySave.addEventListener("click", () => {
                            let inputData = {};
                            /*inputData.pstInfo = {
                                orgnPstNo : pstAllInfo.pstInfo.pstNo
                                , prntPstNo : pstAllInfo.pstInfo.pstNo
                            }*/
                            
                            inputData = pstAllInfo; //원글정보
                            inputData.pstInfo.prntPstNo = pstAllInfo.pstInfo.pstNo;
                            inputData.orgnPstInfo = pstAllInfo; //원글정보
                            inputData.isWriteMode = true;

                            let args = {
                                key: "replyWrite.view"
                                , data: inputData
                            };
                            this.handleEvent(args);
                        });
                        btnReplySave.textContent = "답글등록";
                    }
                }

                //글 삭제
                //일반삭제권한(로그인사용자=글등록자)
                //관리삭제권한                    
                if (this.tboardInstance.bbsAuth.isShowBtnDelete( pstAllInfo.pstInfo.wrtrId )) {
                    btnDel = tboardMng.elements[viewType].etcFld.btnDel.cloneNode(true);
                    btnDel.addEventListener("click", () => {
                        let inputData = pstAllInfo.pstInfo;
                        let args = {
                            key: "basicDelete.tx"
                            , data: inputData
                        };
                        this.handleEvent(args);
                    });
                }

                //글 수정
                if (this.tboardInstance.bbsAuth.isShowBtnEdit( pstAllInfo.pstInfo.wrtrId )) {                 
                    btnEdit = tboardMng.elements[viewType].etcFld.btnEdit.cloneNode(true);                        
                    btnEdit.addEventListener("click", () => {
                        let inputData = {};
                        inputData = pstAllInfo;
                        inputData.isWriteMode = false;

                        let args = {
                            key: "basicWrite.view"
                            , data: inputData
                        };
                        this.handleEvent(args);
                    });
                }

                //목록
                btnList = tboardMng.elements[viewType].etcFld.btnList.cloneNode(true);
                btnList.addEventListener("click", () => {
                    let inputData = {};
                    inputData.viewType = "search";
                    this.openSavedView(inputData);
                });

                if (btnReplyDel) {
                    btnWrapEl.appendChild(btnReplyDel);
                }
                if (btnReplySave) {
                    btnWrapEl.appendChild(btnReplySave);
                }
                if (btnDel) {
                    btnWrapEl.appendChild(btnDel)
                }
                if (btnEdit) {
                    btnWrapEl.appendChild(btnEdit)
                }
                if (btnList) {
                    btnWrapEl.appendChild(btnList);
                } 
            })
            .catch((error) => {
                //console.log(error);
                let inputData = {};
                inputData.searchType = "list";
                this.openSavedView(inputData);
            });
        }
        
        async detailViewTree(_objPst) {

        }

        //화면 리로드
        openSavedView(_args) {
            //console.log(_args.searchType);
            //console.log(_args.viewType);
            if (_args.viewType === "search" && this.tboardInstance.isSearchFlag === false) {
                _args.viewType = "";
                _args.searchType = "list";
            }

            if (_args.viewType) {                
                this.tboardInstance.renderView("savedView", {viewType: _args.viewType});
            }
            else if (_args.searchType === "list") {
                this.searchView({isSearch: true, isPagingInit: false});
            }
            else if (_args.searchType === "detail") {
                if (!_args.data.orgnPstNo) {
                    this.searchView({isSearch: true, isPagingInit: false});
                    return;
                }
                let inputData = {};
                inputData.bbsId = this.tboardInstance.bbsId;
                inputData.pstNo = _args.data.orgnPstNo;
                this.openBasicReadView(inputData);
            }
            //this.tboardInstance.renderView("savedView", _args);            
        }


        //조회 화면 리로드
        searchView(_args) {
            let isSearch = false;
            let args = _args || {};
            if (!args || args.isSearch === true) {
                isSearch = true;
            }            
            if (_args.isPagingInit !== false) {
                this.tboardInstance.bbsPaging.initPageCo();
            }
            this.tboardInstance.renderView("search.cnd");
            this.tboardInstance.renderView("list");
            this.tboardInstance.renderView("search.etc");
            if (isSearch) {
                this.search();
            }
        }


        //조회 화면 리로드
        openBasicAccessView(_args) {
            let isSearch = false;
            let args = _args || {};
            if (!args || args.isSearch === true) {
                isSearch = true;
            }

            this.tboardInstance.bbsPaging.initPageCo()
            this.tboardInstance.renderView("search.cnd");
            this.tboardInstance.renderView("list");
            this.tboardInstance.renderView("search.etc");
            if (isSearch) {
                this.search();
            }
        }


        //상세조회
        async openBasicReadView(_objPst) {
            if (this.tboardInstance.bbsAuth.isTreeReplyType()) {
                await this.detailViewTree(_objPst)
            }
            else {
                await this.detailViewDefault(_objPst)
            }
        }

        
        //답글등록 화면
        async openReplyWriteView(_data) {
            try {

                let viewType = this.tboardInstance.viewType.write;
                this.tboardInstance.renderView(`${viewType}.reply`, _data);

                let writeBtn     = this.tboardInstance.view.writeReply.querySelector(`[class="tboard_footer_buttons"]`);
                let btnPstCancel = this.tboardInstance.view.writeReply.querySelector("[data-tboard-id='btnPstCancel']").cloneNode(false);
                let btnPstSave   = this.tboardInstance.view.writeReply.querySelector("[data-tboard-id='btnPstSave']").cloneNode(false);
                while(writeBtn.firstChild) {
                    writeBtn.firstChild.remove();
                }
                writeBtn.appendChild(btnPstCancel).textContent = "취소";
                writeBtn.appendChild(btnPstSave).textContent = "저장";
                btnPstCancel.addEventListener("click", () => {
                    let inputData = {};
                    inputData.searchType = "";
                    inputData.viewType = "detail";
                    this.openSavedView(inputData);
                });
                //저장버튼
                btnPstSave.addEventListener("click", () => {
                    let args = {
                        key: "replyWrite.tx"
                        , data: _data
                    };
                    this.handleEvent(args);
                });

            } catch (error) {
                //console.log(error);                                
                let inputData = {};
                inputData.searchType = "list";                
                this.openSavedView(inputData);
            } finally {
                //console.log("----replyWriteView");
            }
        }


        //
        async openBasicWriteView(_data) {
            try {
                
                if (this.tboardInstance.bbsAuth.isBasicWrite() === false) {
                    return;
                }

                let viewType = this.tboardInstance.viewType.write;
                this.tboardInstance.renderView(viewType, _data);

                //TODO. 나중에 함수로 변경
                // let writeAuthNodes = this.tboardInstance.view.write.querySelectorAll(`[data-tboard-auth*="basic.write"]`);
                // Array.from(writeAuthNodes).forEach( _node => {
                //     //권한체크
                //     if (this.tboardInstance.bbsAuth.getAuth("basic.write") === false) {
                //         _node.style.display = "none";
                //     }
                // });

                let writeBtn     = this.tboardInstance.view.write.querySelector(`[class="tboard_footer_buttons"]`);
                let btnPstCancel = this.tboardInstance.view.write.querySelector("[data-tboard-id='btnPstCancel']").cloneNode(false);
                let btnPstSave   = this.tboardInstance.view.write.querySelector("[data-tboard-id='btnPstSave']").cloneNode(false);
                while(writeBtn.firstChild) {
                    writeBtn.firstChild.remove();
                }
                writeBtn.appendChild(btnPstCancel).textContent = "취소";
                writeBtn.appendChild(btnPstSave).textContent = "저장";
                btnPstCancel.addEventListener("click", () => {
                    let inputData = {};
                    if (_data.isWriteMode) {
                        inputData.viewType = "search";
                    }
                    else {
                        inputData.viewType = "detail";
                    }
                    this.openSavedView(inputData);
                });
                
                btnPstSave.addEventListener("click", () => {
                    let args = {
                        key: "basicWrite.tx"
                        , data: _data
                    }
                    this.handleEvent(args);
                });

            } catch (error) {
                let inputData = {};
                inputData.searchType = "list";
                this.openSavedView(inputData);
            } finally {
                //console.log("----detailView");
            }
        }        


        async fileDownload(_data) {
            let chkAuth = this.tboardInstance.bbsAuth.chkAuth("fileDownload");
            if (chkAuth.isAuth === false) {
                return;
            }

            let input = _data || {};
            let result = await this.tboardInstance.SERVICE.fileDownload(input);
        }

        async handleEvent(_args) {
            if (!_args || !_args.key) {
                return;
            }

            let authKey = _args.key.split(".")[0];
            let chkAuth = this.tboardInstance.bbsAuth.chkAuth(authKey);
            if (chkAuth.isAuth === false) {
                return;
            }

            let data = _args.data || {};

            if (_args.key === "basicAccess.tx") {
                return this.tboardInstance.bbsFn.searchPstList(data);
            }
            else if (_args.key === "basicWrite.tx") {
                this.tboardInstance.bbsFn.savePst(data);
            }
            else if (_args.key === "basicDelete.tx") {
                this.tboardInstance.bbsFn.deletePst(data);
            }
            else if (_args.key === "replyWrite.tx") {
                this.tboardInstance.bbsFn.saveReplyPst(data);
            }
            else if (_args.key === "replyDelete.tx") {
                this.tboardInstance.bbsFn.deleteReplyPst(data);
            }
            
            //화면오픈            
            if (_args.key === "basicAccess.view") {
                //게시글등록화면
                this.openBasicAccessView(data);
            }
            else if (_args.key === "basicRead.view") {
                //게시글등록화면
                this.openBasicReadView(data);
            }
            else if (_args.key === "basicWrite.view") {
                //게시글등록화면
                this.openBasicWriteView(data);
            }
            else if (_args.key === "replyWrite.view") {
                //답글등록화면
                this.openReplyWriteView(data);
            }

        }

    },

    TboardPaging = class {
        constructor(_instance) {
            this.type  = "default";
            this.tboardInstance = _instance;
            this.node = undefined;
            this.rootNode = undefined;

            this.totalNormalCnt = 0; //일반게시물전체건수
            this.totalCnt = 0; //전체건수
            this.curPageCo = 1; //현재페이지
            this.recordPageCo = 10; //페이지당 아이템수
            this.totalPage = 0; //전체페이지
            this.pageCo = 10; //페이징에 나타낼 페이지수

            this.first = undefined;
            this.last  = undefined;
            this.prev  = undefined;
            this.next  = undefined;
            this.pageBtnGrp = undefined;
            this.pageBtn = undefined;
            this.curentClass = "tboard_paginiation_current";

            this.init();
        }

        init(_type) {
            this.type = _type || "default";
            if (this.type === "default") {
                this.defaultCreate();
            }
        }
        
        render() {
            //
            if (this.type === "default") {
                this.defaultRender();
            }
        }

        initPageCo() {
            this.curPageCo = 1; //현재페이지
        }

        getTotalPageNo() {
            return this.totalPage;
        }

        getCurrentPageNo() {
            return this.curPageCo;
        }

        setCurrentPageNo(_pageNo) {
            this.curPageCo =  _pageNo;
        }

        setRecordPageCo(_recordPageCo) {
            this.recordPageCo =  _recordPageCo;
        }
        
        //
        defaultCreate() {
            this.rootNode = tboardMng.elements.html.search.querySelector(`[class="tboard_pagination"]`).cloneNode(true);
            this.first = this.rootNode.querySelector(`[class="tboard_pagination_first"]`).cloneNode(true);
            this.last  = this.rootNode.querySelector(`[class="tboard_pagination_last"]`).cloneNode(true);
            this.prev  = this.rootNode.querySelector(`[class="tboard_pagination_prev"]`).cloneNode(true);
            this.next  = this.rootNode.querySelector(`[class="tboard_pagination_next"]`).cloneNode(true);
            
            this.pageBtnGrp = this.rootNode.querySelector(`[class="tboard_pagination_pages"]`).cloneNode(true);
            this.pageBtn    = this.pageBtnGrp.querySelector("button").cloneNode(true);
        }


        defaultRender() {
            this.totalPage = Math.ceil(this.totalNormalCnt / this.recordPageCo);
            if (this.totalPage === 0) {
				this.totalPage = 1;
			}
   
            //페이지 그룹
			let pageGroup = Math.ceil(this.curPageCo/this.pageCo) - 1;
            let startPage = pageGroup * this.pageCo + 1;
            let lastPage  = pageGroup * this.pageCo + this.pageCo;

            if (this.totalPage < lastPage) {
                lastPage = this.totalPage;
            }

            //총게시글


            //전체건수
            let cntDipsNode = this.tboardInstance.view.search.querySelector("[class='tboard_count_em']");
            cntDipsNode.textContent = tboardUtil.convertNumber(this.totalCnt);
            //(현재페이지/전체페이지)
            cntDipsNode.nextSibling.remove();
            let pageDispValue = "(0/0)";
            if (this.totalPage > 0) {
                pageDispValue = ` (${this.curPageCo}/${this.totalPage})`;
            }
            cntDipsNode.after(document.createTextNode(pageDispValue));

            //페이징 객체 생성
            let pagination = this.tboardInstance.view.search.querySelector(`[class="tboard_pagination"]`);
            //삭제
            while(pagination.firstChild) {
                pagination.firstChild.remove();
            }

            if (lastPage === 0 || startPage > lastPage) {
                return;
            }
            
            pagination.appendChild(this.first);
            pagination.appendChild(this.prev);
            pagination.appendChild(this.pageBtnGrp);
            pagination.appendChild(this.next);
            pagination.appendChild(this.last);

            //버튼그룹삭제
            while(this.pageBtnGrp.firstChild) {
                this.pageBtnGrp.firstChild.remove();
            }


            let tboardPaging = this;
            for (let index = startPage; index <= lastPage; index++)  {
                let newPageBtn = this.pageBtn.cloneNode(true);

                if (this.curPageCo === index) {
                    newPageBtn.classList.add(this.curentClass);
                }
                newPageBtn.textContent = index;
                this.pageBtnGrp.appendChild(newPageBtn);

                //페이징 이벤트
                newPageBtn.addEventListener("click", function() {
                    if (tboardPaging.curPageCo === index) {
                        return;
                    }
                    tboardPaging.curPageCo = index;
                    tboardPaging.tboardInstance.bbsEvent.search();
                });
            }
            
            //페이징 이벤트
            this.first.addEventListener("click", function() {
                //가장처음
                let movePage = 1;
                //let movePage = startPage; 페이지 그룹중 첫번째

                //
                if (tboardPaging.curPageCo === movePage) {
                    return;
                }
                tboardPaging.curPageCo = movePage;
                tboardPaging.tboardInstance.bbsEvent.search();
            });

            //이전
            this.prev.addEventListener("click", function() {
                
                //바로전페이지
                //let movePage = tboardPaging.curPageCo - 1;
                let movePage = 1;
                //그룹단위 이동 시
                if ( startPage <= tboardPaging.pageCo) {
                    movePage = 1;
                } else {
                    movePage = startPage - tboardPaging.pageCo; // 1, 11, 21 등
                }

                if (tboardPaging.curPageCo === movePage) {
                    return;
                }
                tboardPaging.curPageCo = movePage;
                tboardPaging.tboardInstance.bbsEvent.search();
            });
            
            //다음
            this.next.addEventListener("click", function() {
                //바로디음페이지
                //let movePage = tboardPaging.curPageCo + 1;
                
                //그룹단위 이동 시
                let movePage = startPage + tboardPaging.pageCo;
                if ( movePage > tboardPaging.totalPage) {
                    movePage = tboardPaging.totalPage;
                }

                if (tboardPaging.curPageCo === movePage) {
                    return;
                }
                tboardPaging.curPageCo = movePage;
                tboardPaging.tboardInstance.bbsEvent.search();
            });

            //마자막
            this.last.addEventListener("click", function() {
                //가장마지막
                let movePage = tboardPaging.totalPage;
                //let movePage = lastPage; 그룹단위 이동

                //
                if (tboardPaging.curPageCo === movePage) {
                    return;
                }

                tboardPaging.curPageCo = movePage;
                tboardPaging.tboardInstance.bbsEvent.search();
            });
        }
    },

    TboardSort = class {
        constructor(_instance) {
            this.type  = "default";
            this.tboardInstance = _instance;
            this.defaultSortKey = "pstNoOrder";
            this.currentSortKey = "pstNoOrder" || this.defaultSortKey;
            this.curDispClass   = "tboard_sortBy_item_selected";
            this.node = {};
        }

        render() {
            let sortNodes = this.tboardInstance.view.search.querySelectorAll("[class*='tboard_sortBy_item']");
            let index = 0;
            Array.from(sortNodes).forEach( _node => {
                _node.dataset.tboardFldType = "sort";

                this.node.sort = this.node.sort || {};
                if (index === 0) {
                    this.node.sort["pstNoOrder"] = _node;

                    _node.dataset.tboardSortKey = "pstNoOrder";
                    _node.textContent = "최신순";
                }
                else if (index === 1) {
                    this.node.sort["inqCntOrder"] = _node;

                    _node.dataset.tboardSortKey = "inqCntOrder";
                    _node.textContent = "조회순";
                }
                else if (index === 2) {
                    this.node.sort["pstNmOrder"] = _node;

                    _node.dataset.tboardSortKey = "pstNmOrder";
                    _node.textContent = "제목순";                    
                }
                index = index + 1;
            });
        }

        setCurrent(_target) {

            Object.keys(this.node.sort).forEach( _key => {
                this.node.sort[ _key ].classList.remove(this.curDispClass);
            });
            _target.classList.add(this.curDispClass);
            this.currentSortKey = _target.dataset.tboardSortKey;
        }

        remove() {
            
            let sortNodes = this.tboardInstance.view.search.querySelectorAll("[class*='tboard_sortBy_item']");
            Array.from(sortNodes).forEach( _node => {
                _node.remove();
            });
            
            this.tboardInstance.view.search.querySelector(`[class="tboard_sortBy"]`).style.display = "none";
        }
    },
    TboardRenderView = class {
        constructor(_instance) {            
            this.tboardInstance = _instance;            
        }
        
        basicWriteView() {

            
        }


        // replyWrite() {

        //     //등록 영역
        //     let writeAreaNode = this.view.write.querySelector("[class='tboard_write_con']");

        //     //순서대로
        //     let widthCtl   = 0;
        //     let objConfig  = this.bbsArtcl.user.ctl.write;
        //     let cmpSortSeq = Object.keys(this.bbsArtcl.user.ctl.write.sort).sort((a, b) => Number(a) - Number(b));

        //     cmpSortSeq.forEach( _key => {
        //         let artclNo   = objConfig.sort[_key]; //항목번호
                                    
        //         //화면에 그릴 컴포넌트
        //         let component = this.bbsArtcl.cmp.write.artcl[ artclNo ];

        //         if (component.indctYn !== "Y") {
        //             return;
        //         }

        //         //최초에 한번 등록                    
        //         if (!component.isAppended) {
        //             //로우
        //             let rowNode = tboardMng.elements.writeType1.writeFld.root.cloneNode(true);
                    
        //             if (component.subType === "notice") {
        //                 rowNode.appendChild(component.formEl.checkItem);
        //                 rowNode.appendChild(component.formEl.inputItem);

        //                 writeAreaNode.appendChild(rowNode);
        //             }
        //             else if (component.subType === "secret") {
        //                 rowNode.appendChild(component.formEl.radioItem);                        
        //                 writeAreaNode.appendChild(rowNode);
        //             }
        //             else {
        //                 //로우에 추가 될 등록 화면 사용 컴포넌트 아이템
        //                 let itemNode = component.node;
        //                 itemNode.dataset.tboardArtclNo = artclNo;

        //                 //objConfig
        //                 let isFull = true;
        //                 if (isFull) {
        //                     writeAreaNode.appendChild(rowNode).appendChild(itemNode);
        //                     widthCtl = 0;
        //                 }
        //                 else {
        //                     widthCtl = widthCtl + 50
        //                     if (widthCtl % 100 === 50) {
        //                         //마지막(tboard_search_row)노드의 마지막 tboard_search_item 삭제 후 append
        //                     }
        //                     else {
        //                         writeAreaNode.appendChild(rowNode).appendChild(itemNode);
        //                     }
        //                 }
        //             }
        //             component.isAppended = true;
        //         }

        //         //그 다음 화면 오픈 시 값 만 초기화
        //         component.setInitValue();
        //     });


        //     this.displayView( this.view.write );
        // }

        
        displayView(_viewElement) {
            if (rootNode.firstElementChild instanceof Node) {
                //이전화면 백업
                this.viewTemp.prevPage = rootNode.firstElementChild.cloneNode(true);
                rootNode.firstElementChild.remove();
            }

            rootNode.append( _viewElement );
        }
    },

    TboardOptionConfig = class {
        constructor(_instance) {
            this.tboardInstance = _instance;

            this.file  = {};
            this.thumb = {};

            this.setDefaultConfig();
        }

        setDefaultConfig() {
            this.file = {
                maxSize: 1024*1024*10
                , maxCnt: 10
                , ext: "pdf|hwp|ppt|pptx|xls|xlsx"
            }

            this.thumb = {
                maxSize: 1024*1024*50
                , maxCnt: 1
                , ext: "jpeg|jpg|png|heic|heif|raw"
            }
        }

        setConfig(_key, _config) {

            this[_key] = _config || {};
        }

    },
    
    TboardUserInfo = class {
        constructor(_instance) {
            this.tboardInstance = _instance;
            this.userId = "";
            this.userNm = "";
            this.ipAddr = "";
            this.itemInfo = {};
            this.writeInfo = {};
            this.temp = {
                itemInfo : {}
                , writeInfo : {}
            };
        }

        setUserInfo(_user) {
			this.userId = _user.userId;
            this.userNm = _user.userNm;
            this.ipAddr = _user.ipAddr;
        }

        setUserSettingInfo(_args) {
            this.setItemInfo(_args.itemInfo);

            if (_args.fixInfo && _args.fixInfo.write) {
                this.setTempWriteInfo(_args.writeInfo);
            }
        }

        setSessionInfo(_result) {
            this.setWriteInfo(_result.newWriteInfo);
        }
        
        setItemInfo(_itemInfo) {
            let itemInfo = _itemInfo || {};
            if (Object.keys(itemInfo).length < 1) {
                return;
            }

			this.itemInfo = JSON.parse(JSON.stringify(itemInfo));
        }

        setTempWriteInfo(_writeInfo) {
            let tempWriteInfo = _writeInfo || {};
            if (Object.keys(tempWriteInfo).length < 1) {
                return;
            }

			this.tempWriteInfo = JSON.parse(JSON.stringify(tempWriteInfo));
        }

        setWriteInfo(_writeInfo) {
            let writeInfo = _writeInfo || {};
            if (Object.keys(writeInfo).length < 1) {
                return;
            }

			this.writeInfo = JSON.parse(JSON.stringify(writeInfo));
        }

        isLogin() {
			if (his.userId) {
				return true;
			}
			return false;
		}
    },

    Tboard = class {
        constructor(_args) {            
            
            this.isInit = false;
            this.config = tboardConfig;    //통합게시판설정
            this.tagMap = new TboardElements().tagMap;  //화면태그
            this.bbsAuth = new TboardAuth(this);        //권한
            this.bbsArtcl = new TboardArtcl(this);      //게시판항목
            this.SERVICE = new TboardTransaction(this); //게시판ajax
            this.bbsComGrpCd = new TboardComCode();     //게시판공통코드
            this.bbsEvent = new TboardEvent(this);      //게시판이벤트
            this.bbsPaging = new TboardPaging(this);    //게시판페이징
            this.bbsSort = new TboardSort(this);        //게시판정렬
            this.bbsDfArtcl = new TboardDefaultArtcl(); //게시판기본항목
            this.bbsFn = new TboardFunction(this); //게시판함수
            this.bbsRender = new TboardRenderView(this); //게시판렌더링
            this.bbsConfig = new TboardOptionConfig(this); //게시판설정
            this.bbsUser = new TboardUserInfo(this);

            this.result = {
                search: {}
                , mergeSearch: {}
                , write: {}
            }

            this.bbsEtcNode = {
                search: undefined
                , detail: undefined
                , write: undefined
            }
            
            //data-tboard 관련 태그모음
            this.uuid = tboardUtil.uuidGen();
            
            this.channel = ""; //admin, web, app, mobile
            this.bbsId = "";
            this.bbsGrpId = "";
            this.bbsInfo = undefined;   //게시판정보
            this.bbsFwkAll = undefined; //게시판전체기능
            this.isSearchFlag = false;  //최초조회여부

            this.view  = {
                search : undefined,
                detail : undefined,
                write : undefined,
                reply:  undefined
            }; //화면객체
            this.viewTemp  = {
                prevPage: {

                },
                search : {
                    all: undefined,
                    cnd: undefined,
                    list: undefined
                },                
                detail : {
                    all: undefined
                    , detail: undefined
                    , reply: undefined
                },
                write : undefined
                
            }; //화면객체 복사본

            this.viewType = {
                search: ""
                , detail: ""
                , write: ""
                , reply: ""
            };

            this.fldInfo = {};
            this.rtnData = {
                code: 0
                , msg: ""
            };
        }
        
        checkParam(_args) {
            this.channel = _args.channel || this.config.defaultChannel;
            this.bbsId   = _args.bbsId || "";
            this.bbsGrpId   = _args.bbsGrpId || "";

            if (!this.bbsId) {
                this.rtnData.code = -1;
                this.rtnData.msg = tboardMsg.getMsg("msg_901");
            }
        }

        async build(_args) {
            
            this.checkParam(_args);

            //결과반환
            if (this.rtnData.code === -1) {
                return this.rtnData;
            }
            if (_args.systemCd) {
                this.config.systemCd = _args.systemCd || "10";
            }

            //파라메터로 받은 조건값(아이템)
            this.bbsUser.setUserSettingInfo(_args);

            let itemData = {writeInfo : _args?.fixInfo?.write || {}};
            let pmsnData = await this.SERVICE.getBbsDefaultInfo(itemData);
            if (pmsnData.code !== 0) {
                this.rtnData.code = -1;
                let msgCode = pmsnData.subMessage || "msg_902";
                this.rtnData.msg = tboardMsg.getMsg(msgCode);
                return this.rtnData;
            }
            
            //게시판 기본정보
            this.bbsInfo = pmsnData.response.bbsInfo;

            //사용자 정보
            this.bbsUser.setUserInfo(pmsnData.response.userInfo);
            //세션사용정보
            this.bbsUser.setSessionInfo(pmsnData.response);

            //게시판 사용 공통코드
            this.bbsComGrpCd.initComCodeList(pmsnData.response.astComCode, pmsnData.response.acmComCode);

            //게시판 기능정보
            this.bbsFwkAll = pmsnData.response.bbsFwkAll;

            //게시판 권한저장
            this.bbsAuth.setAuth(pmsnData.response.bbsFwkAll);

            //화면 틀 생성            
            this.createView(this.bbsFwkAll.boardtype);

            //게시판 항목정보
            this.bbsArtcl.setBbsArtcl(pmsnData.response);

            //항목 컴포넌트 생성(searchType1, searchType2, searchType3)
            this.bbsArtcl.createBbsComponent();

            if (this.bbsAuth.isGalleryType()) {
                this.bbsPaging.setRecordPageCo(12);
            }

            //기타 화면 노드
            this.registEtcNode();

            //기본화면 세팅(화면 타입별 조회 화면 생성)
            this.bbsEvent.searchView({isSearch: false, isPagingInit: true});

            //접근권한
            if (this.bbsAuth.isBasicAccess() == false) {
                return;
            }
            
            //권한에 따른 화면 구성
            if (this.bbsAuth.getAuth(this.bbsAuth.idMap.basicWrite)) {
                let searchAuthNodes = this.view.search.querySelectorAll("[data-tboard-auth]");

                Array.from(searchAuthNodes).forEach( _node => {
                    //권한체크
                    if (this.bbsAuth.getAuth(_node.dataset.tboardAuth) === false) {
                        _node.remove();
                    }
                });
            }

            //기본 이벤트
            this.bbsEvent.addDefaultEvent();
            
            //검색
            if (_args.pstNo) {
                let inputData = {};
                inputData.bbsId = _args.bbsId;
                inputData.pstNo = _args.pstNo;
                
                await this.bbsEvent.openBasicReadView(inputData);
            } else {
                await this.bbsEvent.search();
            }

            return this.rtnData;
        }

        registEtcNode() {
            //this.bbsEtcNode.search
            //tboard_sortBy_item 
            //this.bbsEtcNode.search.countGrp = tboardMng.elements.html.search.querySelector("[class='tboard_count']").clondeNode(true);
            //this.bbsEtcNode.search.count = tboardMng.elements.html.search.querySelector("[class='tboard_count_em']").clondeNode(true); 
            //this.bbsEtcNode = {
        }


        getViewType(_viewType) {
            const viewTypeMap = {
                type1: {
                    search: "searchType1"
                    , detail: "detailType1"
                    , write: "writeType1"
                    , reply:  "replyType1"
                    , writeReply: "writeReplyType1"
                },
                type2: {
                    search: "searchType2"
                    , detail: "detailType2"
                    , write: "writeType1"
                    , reply:  ""
                    , writeReply: "writeReplyType1"
                },
                type3: {
                    search: "searchType3"
                    , detail: ""
                    , write: "writeType1"
                    , reply:  ""
                    , writeReply: "writeReplyType1"
                }
            }

            return viewTypeMap[_viewType];
        }

        createView(_type) {
            //화면타입     
            this.viewType = this.getViewType(_type);

            if (!this.view.search) {
                this.view.search = tboardMng.getViewCloneNode( this.viewType.search );                
            }
            if (!this.view.detail) {
                this.view.detail = tboardMng.getViewCloneNode( this.viewType.detail );
            }
            if (!this.view.write) {
                this.view.write  = tboardMng.getViewCloneNode( this.viewType.write );
                this.view.writeReply  = tboardMng.getViewCloneNode( this.viewType.write );
            }
            if (!this.view.reply) {
                this.view.reply  = tboardMng.getViewCloneNode( this.viewType.reply );                
            }    
        }


        renderView(_type, _data, _isAppend) {
            let rootNode = undefined;            
            if (this.isInit === false) {
                let selectorDataset = `[${this.tagMap.dataset.tbId}="${this.tagMap.divInitRoot}"]`;
                let selectorClass = `div.${this.tagMap.divInitRoot}:not([${this.tagMap.dataset.tbPageId}])`;
                rootNode =  document.querySelector(selectorClass);
                if (!rootNode) {
                    rootNode = document.querySelector(selectorDataset);
                }

                rootNode.dataset.tboardPageId = this.uuid;
                rootNode.dataset.tboardId = "tboard-root" + "-" + this.uuid;

                //화면 로드 여부
                this.isInit = true;
            }
            else {
                let selector = `[${this.tagMap.dataset.tbPageId}="${this.uuid}"]`;
                rootNode =  document.querySelector(selector);
            }


            if (_type === "savedView") {
                //이전화면 백업
                if (rootNode.firstElementChild instanceof Node) {
                    this.viewTemp.prevPage = rootNode.firstElementChild.cloneNode(true);
                    rootNode.firstElementChild.remove();
                }
                rootNode.append(this.view[_data.viewType]);
                return;
            }

            //처리 매핑
            if (_type === "list") {
                try {
                    let postFix = this.viewType.search.split("search")[1] || 'type1';
                    _type = `${_type}.${postFix.toLowerCase()}`;
                } catch(error) {
                    _type= "list.type1";
                }
            }


            if (_type === "search.etc") {
                //검색버튼
                //등록버튼

                //정렬
                //화면 설정에 따라 설정해야 되는 경우
            }
            else if (_type === "search.cnd") {

                //하위노드 전체 삭제
                if (rootNode.firstElementChild instanceof Node) {
                    this.viewTemp.search.all = rootNode.firstElementChild.cloneNode(true);
                    rootNode.firstElementChild.remove();
                }

                //조회조건 영역
                let searchCndAreaNode = this.view.search.querySelector("[class='tboard_search_con']");
                
                let objConfig  = this.bbsArtcl.user.ctl.search;
                let cmpSortSeq = Object.keys(objConfig.sort).sort((a, b) => Number(a) - Number(b));

                //let ctrlEntries = Object.entries(cmpSortSeq);
                let crntArtclNo = "";
                let nextArtclNo = "";
                for (let i = 1; i <= cmpSortSeq.length; i++) {
                    crntArtclNo = objConfig.sort[i];
                    nextArtclNo = cmpSortSeq.length > i + 1 ? "" : objConfig.sort[i + 1];

                    //console.log(i, objConfig.control[crntArtclNo] , objConfig.control[nextArtclNo]);
                }


                //조회조건 순서대로
                let isDefaultType1 = false;
                let widthCtl = 0;
                Object.keys(this.bbsArtcl.user.ctl.search.sort).forEach( _key => {
                    let artclNo   = this.bbsArtcl.user.ctl.search.sort[_key];
                    let artclInfo = this.bbsArtcl.user.ctl.search.control[artclNo];
                    let cptKey = "";
                    let isFull = true;
                    if (artclInfo.cpt === "defaultType1") {
                        if (isDefaultType1 === true) {
                            return;
                        }
                        isDefaultType1 = true;
                        cptKey = "defaultType1";
                    }
                    else {
                        cptKey = artclNo;
                    }

                    let cndNode = this.bbsArtcl.cmp.search[ cptKey ].node;
                    if (isFull) {                        
                        searchCndAreaNode.appendChild(cndNode);
                        widthCtl = 0;
                    }
                    else {
                        widthCtl = widthCtl + 50
                        if (widthCtl % 100 === 50) {
                            //마지막(tboard_search_row)노드의 마지막 tboard_search_item 삭제 후 append
                        }
                        else {
                            searchCndAreaNode.appendChild(cndNode);
                        }
                    }
                });

                rootNode.append(this.view.search);
            }
            else if (_type === "list.type1") {
                let data = _data || {};
                this.bbsPaging.totalCnt = Number(data.totalCnt) || 0;
                this.bbsPaging.totalNormalCnt = Number(data.totalNormalCnt) || 0;
                
                //페이징 렌더링
                this.bbsPaging.render();

                //페이징 렌더링
                this.bbsSort.render();
   
                //리스트 영역
                let tboard_list = this.view.search.querySelector("[class='tboard_list']");
                
                //백업
                this.viewTemp.list = tboard_list.cloneNode(true);

                //삭제
                while(tboard_list.firstChild) {
                    tboard_list.firstChild.remove();
                }

                //헤더 추가                
                tboard_list.append(this.bbsArtcl.cmp.list.header.node.cloneNode(true));

                //리스트 추가
                if (!data.baseList) {
                    return;
                }

                //동적항목
                let objArtcl = {};
                if (Array.isArray(data.artclInfo) && data.artclInfo.length > 0) {
                    Object.keys(data.artclInfo).forEach( _key => {
                        let dataKey = data.artclInfo[ _key].pstNo + data.artclInfo[ _key].artclNo;
                        objArtcl[dataKey] = data.artclInfo[ _key];
                    });
                }

                //첨부파일항목
                let objAtchList = {};
                if (Array.isArray(data.atchList) && data.atchList.length > 0) {
                    Object.keys(data.atchList).forEach( _key => {
                        let dataKey = data.atchList[ _key].pstNo + data.atchList[ _key].bbsAtcflNo;
                        objAtchList[dataKey] = data.atchList[ _key];
                    });
                }

                //데이터 건수 만큼 생성
                //let pstList = [...data.baseList, ...data.pstList];
                for (const index in data.baseList) {
                    let pstNo = data.baseList[index].pstNo;
                    let filteredData = data.pstList.filter(data => {return data.pstNo === pstNo})[0];
                    let objPst = {...data.baseList[index], ...filteredData};

                    let copyNode = this.bbsArtcl.cmp.list.column.node.cloneNode(true);

                    Object.keys(this.bbsArtcl.user.ctl.list.sort).forEach( _key => {
                        let artclNo      = this.bbsArtcl.user.ctl.list.sort[ _key ];            //항목번호
                        let artclCtlInfo = this.bbsArtcl.user.ctl.list.control[ artclNo ]; //항목별 제어 정보
                        let mask         = artclCtlInfo.mask || "";
                        //기본항목, 동적항목 구분
                        let dataKey = this.bbsDfArtcl.get(artclNo) || pstNo + artclNo;
                        let value = "";
                     
                        //특정기능(번호)
                        if (dataKey === "noAsc" || dataKey === "noDesc") {                            
                            if (dataKey === "noDesc") {
                                //value = this.bbsPaging.totalCnt - ((this.bbsPaging.curPageCo -1) * this.bbsPaging.recordPageCo);
                                value = this.bbsPaging.totalCnt - Number(objPst.rnum) + 1;
                            }
                            else if (dataKey === "noAsc") {
                                value = objPst.rnum;
                                //value = ((this.bbsPaging.curPageCo - 1) * this.bbsPaging.recordPageCo);
                                //value = value + Number(objPst.rnum);
                            }
                            value = tboardUtil.convertNumber(value);
                            artclCtlInfo.cpt = "defaultType1";

                            //공지
                            if (objPst.pstSeCd === "1200002") {
                                value = "공지";
                            }
                            else if (objPst.pstSeCd !== "1200002") {
                                copyNode.classList.remove("tboard_list_notice");
                            }
                        }
                        //게시판기본에서 데이터
                        else if (this.bbsDfArtcl.get(artclNo)) {
                            
                            value = objPst[ dataKey ];
                            value = this.bbsDfArtcl.applyMaskByArtclNo(artclNo, value, mask);
                        }
                        //게시판항목에서 데이터
                        else {
                            let tempObj = objArtcl[ dataKey ] || {};
                            value = tempObj.lcpctyArtclInptYn === "Y" ? tempObj.artclLcpctyInptCn : tempObj.artclInptCn;

                            if (artclCtlInfo.src && artclCtlInfo.cct) {
                                let valueMerge = "";
                                if (value) {
                                    value.split("|").forEach( data => {
                                        valueMerge = valueMerge + (valueMerge ? (", " + this.bbsComGrpCd.getCodeNm(artclCtlInfo.cct, artclCtlInfo.src, data)) : this.bbsComGrpCd.getCodeNm(artclCtlInfo.cct, artclCtlInfo.src, data));
                                    });
                                }
                                value = valueMerge;
                            }
                            else {
                                //마스크
                                value = this.bbsDfArtcl.applyMaskByArtclNo(artclNo, value, mask);
                            }
                        }

                        if (artclCtlInfo.cpt === "defaultType1") {
                            copyNode.querySelector(`[data-tboard-artcl-no=${artclNo}]`).querySelector("[class='tboard_list_item_title']").nextSibling.remove();
                            /*TODO - 값하고 CSS 연결 */
                            if (dataKey === "replyYn") {

                                let tempDiv = document.createElement("div");
                                if (value === "Y") {
                                    value = "답변완료";
                                    tempDiv.classList.add("tboard_tag_type01");
                                }
                                else if (value === "N") {
                                    value = "답변대기";
                                    tempDiv.classList.add("tboard_tag_type02");
                                }
                                tempDiv.textContent = value;
                                copyNode.querySelector(`[data-tboard-artcl-no=${artclNo}]`).querySelector("[class='tboard_list_item_title']").after(tempDiv);
                            }
                            else {
                                copyNode.querySelector(`[data-tboard-artcl-no=${artclNo}]`).querySelector("[class='tboard_list_item_title']").after(value);
                            }
                            
                        }
                        else if (artclCtlInfo.cpt === "titleType1") {
                            let controlNode = copyNode.querySelector(`[data-tboard-artcl-no=${artclNo}]`).querySelector("[class='tboard_list_subject']");
                            controlNode.removeChild(controlNode.lastChild);
                            controlNode.href = "javascript:void(0);"
                            
                            //신규여부
                            let isNew = tboardUtil.checkDateBefore(objPst.regYmd, 3);
                            if (isNew === false) {
                                //아이콘삭제
                                copyNode.querySelector("[class='tboard_list_new']").remove();
                            }
                            
                            //공개여부
                            if (objPst.rlsYn === "Y") {
                                //아이콘삭제
                                copyNode.querySelector("[class='tboard_icon_locked']").remove();
                            }

                            controlNode.title = value;
                            let textNode = document.createTextNode(value);
                            controlNode.appendChild(textNode);

                            controlNode.addEventListener("click", () => {
                                let args = {
                                    key: "basicRead.view"
                                    , data: objPst
                                };
                                this.bbsEvent.handleEvent(args);
                                //let pstInfo = objPst;
                                //this.bbsEvent.detailView(pstInfo);
                            });
                        }
                        else if (artclCtlInfo.cpt === "atchType1") {
                            dataKey = objPst.pstNo + artclNo;

                            let controlNode = copyNode.querySelector(`[data-tboard-artcl-no=${artclNo}]`);
                            let aLinkNode = controlNode.querySelector("[class='tboard_icon_download']");
                            
                            let tempObj = objAtchList[ dataKey ] || {};
                            if (!tempObj.bbsAtcflYn || tempObj.bbsAtcflYn !== "Y") {
                                aLinkNode.remove();
                                return;
                            }

                            aLinkNode.addEventListener("click", () => {
                                let fileDown = {
                                    pstNo: objPst.pstNo
                                    , artclNo: artclNo
                                    , bbsAtcflNo: "all"
                                    , pstNm: objPst.pstNm
                                    , fileNm: ""
                                }
                                this.bbsEvent.fileDownload(fileDown);
                            });

                        }
                        //console.log(artclCtlInfo.cpt);
                    });
                    tboard_list.append(copyNode);
                }
            }
            else if (_type === "list.type2") {
                let data = _data || {};
                
                this.bbsPaging.totalCnt = Number(data.totalCnt) || 0;
                this.bbsPaging.totalNormalCnt = Number(data.totalNormalCnt) || 0;
                
                //페이징 렌더링
                this.bbsPaging.render();

                //페이징 렌더링
                this.bbsSort.render();

                //데이터 없으면 종료
                if (!data.baseList) {
                    return;
                }

                //
                let artclData = {};
                if (Array.isArray(data.artclInfo) && data.artclInfo.length > 0) {
                    Object.keys(data.artclInfo).forEach( _key => {
                        let dataKey = data.artclInfo[ _key].pstNo + data.artclInfo[ _key].artclNo;
                        artclData[dataKey] = data.artclInfo[ _key];
                    });
                }

                let template = document.createDocumentFragment();
                for (const index in data.baseList) {
                    let pstNo = data.baseList[index].pstNo;
                    let filteredData = data.pstList.filter(data => {return data.pstNo === pstNo})[0];
                    let pstData = {...data.baseList[index], ...filteredData};
                    
                    let thumbData = data.thumbList.filter(thumb => thumb.pstNo === pstData.pstNo) || [];
                    
                    //this.bbsArtcl.cmp.list.item.setThumb(filtedData);
                    let copyNode = this.bbsArtcl.cmp.list.item.getItemEl(pstData, thumbData, artclData);
                    template.appendChild(copyNode);
                }
                //리스트 영역
                let tboard_list = this.view.search.querySelector(`[data-tboard-fld-grp="galleryList"]`);
                //삭제
                while(tboard_list.firstChild) {
                    tboard_list.firstChild.remove();
                }
                tboard_list.appendChild(template);
            }
            else if (_type === "list.type3") {
                let data = _data || {};
                
                if (Object.keys(data).length < 1) {
                    this.bbsPaging.totalCnt = 0;
                }
                else if (data.baseList.length > 0) {                    
                    this.bbsPaging.totalCnt = Number(data.totalCnt) || 0;
                }

                //페이징 렌더링
                this.bbsPaging.render();

                //페이징 렌더링
                this.bbsSort.remove();
                                
                let tboardFldGrp = tboardMng.elements.searchType3.faqFld.root.dataset.tboardFldGrp;

                //리스트 영역
                let tboard_list = this.view.search.querySelector(`[data-tboard-fld-grp='${tboardFldGrp}']`);
                
                //백업
                this.viewTemp.list = tboard_list.cloneNode(true);

                //삭제
                while(tboard_list.firstChild) {
                    tboard_list.firstChild.remove();
                }

                //TODO: 조회된 데이터가 없습니다 표시
                //데이터 없으면 종류
                if (!data.baseList) {
                    return;
                }

                //데이터 건수 만큼 생성                
                for (const index in data.baseList) {
                    let pstNo = data.baseList[index].pstNo;
                    let filteredData = data.pstList.filter(data => {return data.pstNo === pstNo})[0];
                    let objPst = {...data.baseList[index], ...filteredData};

                    //FAQ ITEM
                    let copyNode  = this.bbsArtcl.cmp.list.defaulType1.node.cloneNode(true);
                    let faqTitle  = copyNode.querySelector(`[data-tboard-id="faqTitle"]`);
                    let faqAnswer = copyNode.querySelector(`[data-tboard-id="faqAnswer"]`);
                    faqTitle.textContent  = objPst.pstNm;

                    //답변
                    //TODO
                    faqAnswer.style.flexDirection = "column";
                    faqAnswer.style.alignItems = "flex-start";
                    let template = document.createElement("template");
                    //template.innerHTML = objPst.artclLcpctyInptCn ? objPst.artclLcpctyInptCn : objPst.pstCn;
                    
                    template.innerHTML = (objPst.pstCn|| "").replace(/\n/g, "<br>");
                    while (faqAnswer.firstChild) {
                        faqAnswer.firstChild.remove();
                    }
                    faqAnswer.appendChild(template.content);

                    
                    //첨부파일                    
                    if (this.bbsArtcl.user.info["D080100001"]) {
                        
                        data.fileList = data.fileList || [];
                        let filteredData = data.fileList.filter( file => file.pstNo === objPst.pstNo);
                        if (filteredData.length > 0) {
                            let atchRoot = copyNode.querySelector(".tboard_article_files");
                            let atchInfo = tboardMng.elements.searchType3.atchFld.info.cloneNode(true);
                            //스타일
                            atchRoot.style.paddingLeft  = "0";
                            atchRoot.style.paddingRight = "0";

                            //파일수
                            atchInfo.querySelector(`[data-tboard-fld-id="atchCnt"]`).textContent = filteredData.length;

                            //파일정보
                            atchRoot.appendChild(atchInfo);

                            //파일아이템
                            filteredData.forEach( fileInfo => {
                                let fileName  = fileInfo.bbsOrgnlAtcflNm;
                                let fileSize  = tboardUtil.formatBytes(fileInfo.bbsAtcflSz);
                                let dispValue = `${fileName} [${fileSize}]`;
                                
                                let fileItem = tboardMng.elements.detailType1.atchFld.item.cloneNode(true);
                                fileItem.querySelector(`[data-tboard-fld-id="atchFileNm"]`).textContent = dispValue;
    
                                let btnDown = fileItem.querySelector("button");
                                btnDown.addEventListener("click", () => {
                                    let fileDown = {
                                        pstNo: objPst.pstNo
                                        , artclNo: "D080100001"
                                        , bbsAtcflNo: fileInfo.bbsAtcflNo
                                        , pstNm: objPst.pstNm
                                        , fileNm: fileInfo.bbsOrgnlAtcflNm
                                    }
                                    this.bbsEvent.fileDownload(fileDown);
                                });



                                atchRoot.appendChild(fileItem);
                            });

                            faqAnswer.appendChild(atchRoot);
                        }
                    }
                    
                    //item 추가
                    tboard_list.append(copyNode);

                    //클릭 이벤트
                    faqTitle.addEventListener('click', function(event) {
                        event.target.classList.toggle('tboard_faq_question_opened');
                        const answerElement = event.target.nextElementSibling;
                        if (answerElement && answerElement.classList.contains('tboard_faq_answer')) {
                          if (answerElement.style.maxHeight) {
                            answerElement.style.maxHeight = null;
                          }
                          else {
                            answerElement.style.maxHeight = answerElement.scrollHeight + 40 + 'px';
                          }
                        }
                    });
                }
            }
            //detail.type1
            else if (_type === "detailType1") {
                let pstData     = _data.pstInfo; //게시물데이터                
                let movePstData = _data.movePstInfo; //이전,다음데이터
                let atcflData   = _data.atcflInfo; //첨부데이터
                let artclData   = _data.artclInfo; //항목데이터
                
                //화면 재생성
                this.view.detail = tboardMng.getViewCloneNode( this.viewType.detail );

                //초기화
                let initNodes = this.view.detail.querySelectorAll("[data-tboard-fld-id]");
                initNodes.forEach( _node => {
                    _node.textContent = "";
                });

                //상세화면 항목 순서
                let objConfig  = this.bbsArtcl.user.ctl.detail;
                Object.keys( objConfig.sort ).forEach( _key => {
                    let artclNo   = objConfig.sort[_key];
                    let artclCtlInfo = objConfig.control[artclNo]; //항목설정
                    let mask         = artclCtlInfo.mask || "";

                    let detailCmp = this.bbsArtcl.cmp.detail.artcl[ artclNo ];
                    let artclKrNm = this.bbsArtcl.getArtclNm(artclNo);
                    let artclDbNm = this.bbsDfArtcl.get(artclNo);
                    let artclValue = "";
                    let value = "";
                    if (artclData[artclNo]) {
                        artclValue = artclData[artclNo].lcpctyArtclInptYn === "Y" ? artclData[artclNo].artclLcpctyInptCn : artclData[artclNo].artclInptCn;
                    }
                    value = (artclDbNm) ? pstData[artclDbNm] || "" : artclValue || "";
                    
                    
                    //제목, 내용 등
                    if (artclDbNm === "pstNm") {                        
                        let nodes = this.view.detail.querySelectorAll(`[data-tboard-fld-id="${artclDbNm}"]`);
                        nodes.forEach( _node => {
                            _node.textContent = value || "";
                        });
                    }
                    else if (artclDbNm === "pstCn" || detailCmp.type === "editType1") {
                        let contentNode = null;
                        let template = document.createElement("template");
                        if (artclDbNm === "pstCn") {
                            //value = pstData.lcpctyArtclInptYn === "Y" ? pstData.artclLcpctyInptCn : pstData.pstCn;

                            //게시물내용 노드
                            contentNode = this.view.detail.querySelector(`[data-tboard-fld-id="pstCn"]`);
                        }
                        else if (detailCmp.type === "editType1") {
                            //value = value;

                            //에디터 노드
                            let editNodes = this.view.detail.querySelectorAll(`[data-tboard-fld-type="dtlFld.editType1"]`);
                            editNodes[editNodes.length - 1].after(detailCmp.node);
                            contentNode = detailCmp.node;
                        }
                        value = value.replace(/\n/g, "<br>");
                        template.innerHTML = value;
                        contentNode.appendChild(template.content);
                        //TODO css 수정 필요
                        contentNode.style.wordBreak = "break-word";
                        //초기화
                    }
                    else if (detailCmp.type === "defaultType1") {
                        detailCmp.node.dataset.tboardId = artclNo;
                        let tboardFldType = detailCmp.node.dataset.tboardFldType;
                        let grpKey = tboardFldType.split(".")[0];
                        
                        if (artclCtlInfo.cct && artclCtlInfo.src) {
                            value = this.bbsComGrpCd.getCodeNm(artclCtlInfo.cct, artclCtlInfo.src, value);
                        }
                        else {
                            value = this.bbsDfArtcl.applyMaskByArtclNo(artclNo, value, mask);
                        }

                        let grpNode = this.view.detail.querySelector(`[data-tboard-fld-grp="${grpKey}"]`);
                        if (grpNode.querySelector(`[data-tboard-id="${artclNo}"]`)) {
                            grpNode.querySelector(`[data-tboard-id="${artclNo}"]`).textContent = value;
                        }
                        else {
                            grpNode.appendChild(detailCmp.node);
                            detailCmp.node.textContent = value;
                        }
                    }
                    else if (detailCmp.type === "defaultType2") {
                        detailCmp.node.dataset.tboardId = artclNo;
                        let tboardFldType = detailCmp.node.dataset.tboardFldType;
                        let grpKey = tboardFldType.split(".")[0];

                        if (artclCtlInfo.cct && artclCtlInfo.src) {
                            value = this.bbsComGrpCd.getCodeNm(artclCtlInfo.cct, artclCtlInfo.src, value);
                        }
                        else {
                            value = this.bbsDfArtcl.applyMaskByArtclNo(artclNo, value, mask);
                        }

                        value = `${artclKrNm}: ${value}`;
                        let grpNode = this.view.detail.querySelector(`[data-tboard-fld-grp="${grpKey}"]`);
                        if (grpNode.querySelector(`[data-tboard-id="${artclNo}"]`)) {
                            grpNode.querySelector(`[data-tboard-id="${artclNo}"]`).textContent = value;
                        }
                        else {
                            grpNode.appendChild(detailCmp.node);
                            detailCmp.node.textContent = value;
                        }
                    }
                    else if (detailCmp.type === "atchType1") {
                        //항목 별 첨부파일로 분리
                        let atchFileList = atcflData.filter( _data => {return _data.bbsAtcflNo.indexOf(detailCmp.artclInfo.artclNo) > -1});
                        if (atchFileList.length < 1) {
                            return;
                        }
                        
                        let fileGrpNode  = this.view.detail.querySelectorAll(`[data-tboard-fld-grp="atchFld"]`);
                        let lastFileNode = fileGrpNode[fileGrpNode.length - 1];
                        
                        //기본 첨부파일
                        let procNode = this.view.detail.querySelector(`[data-tboard-artcl-no=${artclNo}]`);
                        if (!procNode) {
                            procNode = detailCmp.node;
                            procNode.dataset.artclNo = artclNo;

                            let fileInfoNode   = null;
                            let btnAllDownNode = null;
                            if (!procNode.querySelector(`[data-tboard-fld-type="atchFld.info"]`)) {
                                fileInfoNode = tboardMng.elements.detailType1.atchFld.info.cloneNode(true);
                                procNode.appendChild(fileInfoNode);
                            }

                            if (!procNode.querySelector(`[data-tboard-fld-type="atchFld.btnAll"]`)) {
                                btnAllDownNode =  tboardMng.elements.detailType1.atchFld.btnAll.cloneNode(true);
                                procNode.appendChild(btnAllDownNode);

                                btnAllDownNode.addEventListener("click", () => {
                                    let fileDown = {
                                        pstNo: pstData.pstNo
                                        , artclNo: artclNo
                                        , bbsAtcflNo: "all"
                                        , pstNm: pstData.pstNm
                                        , fileNm: ""
                                    }
                                    this.bbsEvent.fileDownload(fileDown);
                                });
                            }
                        }

                        //파일건수
                        procNode.querySelector(`[data-tboard-fld-id="atchCnt"]`).textContent = atchFileList.length;

                        //item 삭제
                        procNode.querySelectorAll(`[data-tboard-fld-type="atchFld.item"]`).forEach(_node => {
                            _node.remove();
                        })

                        //item 추가
                        for (const fileInfo of atchFileList) {
                            let fileName = fileInfo.bbsOrgnlAtcflNm;
                            let fileSize = tboardUtil.formatBytes(fileInfo.bbsAtcflSz);
                            let dispValue = `${fileName} [${fileSize}]`;
                            
                            let fileItem = tboardMng.elements.detailType1.atchFld.item.cloneNode(true);
                            fileItem.querySelector(`[data-tboard-fld-id="atchFileNm"]`).textContent = dispValue;

                            let btnDown = fileItem.querySelector("button");
                            btnDown.addEventListener("click", () => {
                                let fileDown = {
                                    pstNo: pstData.pstNo
                                    , artclNo: artclNo
                                    , bbsAtcflNo: fileInfo.bbsAtcflNo
                                    , pstNm: pstData.pstNm
                                    , fileNm: fileInfo.bbsOrgnlAtcflNm
                                }                                
                                this.bbsEvent.fileDownload(fileDown);
                            });

                            detailCmp.node.appendChild(fileItem);
                        }

                        lastFileNode.after(detailCmp.node);
                    }
                });

                //기타노드(이전,다음,버튼)
                Object.keys(tboardMng.elements.detailType1.etcFld).forEach( _key => {
                    let etcNode = tboardMng.elements.detailType1.etcFld[_key].cloneNode(true);

                    let sourceNode = this.view.detail.querySelector(`[data-tboard-fld-type="${etcNode.dataset.tboardFldType}"]`);
                    sourceNode.replaceWith(etcNode);
                });


                //이전, 다음
                let prevDetail = this.view.detail.querySelector(`[data-tboard-fld-id="prevDetail"]`);
                let nextDetail = this.view.detail.querySelector(`[data-tboard-fld-id="nextDetail"]`);

                if (movePstData.prevPstNo === "none") {
                    prevDetail.textContent = "이전 글이 없습니다.";
                }
                else {
                    while(prevDetail.firstChild) {
                        prevDetail.firstChild.remove();
                    }
                    let aLink = document.createElement("a");
                    aLink.href = "javascript:void(0);"
                    aLink.textContent = movePstData.prevPstNm;
                    
                    aLink.addEventListener("click", () => {
                        let input = {
                            bbsId: pstData.bbsId
                            , pstNo: movePstData.prevPstNo
                        }
                        let args = {
                            key: "basicRead.view"
                            , data: input
                        };
                        this.bbsEvent.handleEvent(args);
                    });

                    prevDetail.appendChild(aLink);
                }

                if (movePstData.nextPstNo === "none") {
                    nextDetail.textContent = "다음 글이 없습니다.";
                }
                else {
                    while(nextDetail.firstChild) {
                        nextDetail.firstChild.remove();
                    }
                    let aLink = document.createElement("a");
                    aLink.href = "javascript:void(0);"
                    aLink.textContent = movePstData.nextPstNm;
                    aLink.addEventListener("click", () => {
                        let input = {
                            bbsId: pstData.bbsId
                            , pstNo: movePstData.nextPstNo
                        }
                        let args = {
                            key: "basicRead.view"
                            , data: input
                        };
                        this.bbsEvent.handleEvent(args);
                    });

                    nextDetail.appendChild(aLink);
                }

                //이전화면 백업
                if (rootNode.firstElementChild instanceof Node) {
                    this.viewTemp.prevPage = rootNode.firstElementChild.cloneNode(true);
                    rootNode.firstElementChild.remove();
                }
                rootNode.append(this.view.detail);
            }
            else if (_type === "detailType2") {
                let pstDtlData  = _data || {}; //게시물데이터                
                
                //화면 재생성
                this.view.detail = tboardMng.getViewCloneNode( this.viewType.detail );

                //초기화
                let initNodes = this.view.detail.querySelectorAll("[data-tboard-fld-id]");
                initNodes.forEach( _node => {
                    _node.textContent = "";
                });
                
                this.bbsArtcl.cmp.detail.view.setDetailView(pstDtlData);

                //이전화면 백업
                if (rootNode.firstElementChild instanceof Node) {
                    this.viewTemp.prevPage = rootNode.firstElementChild.cloneNode(true);
                    rootNode.firstElementChild.remove();
                }
                rootNode.append(this.view.detail);
            }
            else if (_type === "replyType1") {
                let pstData     = _data.pstInfo; //게시물데이터
                let atcflData   = _data.atcflInfo; //첨부데이터
                let artclData   = _data.artclInfo; //항목데이터
                let orgnPstData = _data.orgnPstInfo; //원게시물데이터
                if (!pstData) {
                    return;
                }
                //화면 재생성
                this.view.reply = tboardMng.getViewCloneNode( this.viewType.reply );

                //초기화
                let initNodes = this.view.reply.querySelectorAll("[data-tboard-fld-id]");
                initNodes.forEach( _node => {
                    _node.textContent = "";
                });

                //상세화면 항목 순서
                let objConfig  = this.bbsArtcl.user.ctl.reply;
                let cmpSortSeq = Object.keys(objConfig.sort).sort((a, b) => Number(a) - Number(b));
                cmpSortSeq.forEach( _key => {
                    let artclNo   = objConfig.sort[_key];
                    let artclCtlInfo = objConfig.control[artclNo]; //항목설정                    
                    let mask         = artclCtlInfo.mask || "";
                    let detailCmp  = this.bbsArtcl.cmp.reply.artcl[ artclNo ];
                    let artclKrNm  = this.bbsArtcl.getArtclNm(artclNo);
                    let artclDbNm  = this.bbsDfArtcl.get(artclNo);
                    let artclValue = "";
                    let value = "";
                    if (artclData[artclNo]) {
                        artclValue = artclData[artclNo].lcpctyArtclInptYn === "Y" ? artclData[artclNo].artclLcpctyInptCn : artclData[artclNo].artclInptCn;
                    }
                    value = (artclDbNm) ? pstData[artclDbNm] || "" : artclValue || "";
                    
                    //제목, 내용 등
                    if (artclDbNm === "pstNm") {
                        let pstNmEl = this.view.reply.querySelector(`[data-tboard-fld-id="${artclDbNm}"]`);

                        let replyStatEl = tboardMng.elements.replyType1.etcFld.replyStatus.cloneNode(true);
                        pstNmEl.appendChild(replyStatEl);
                        pstNmEl.appendChild(document.createTextNode(value || ""));
                    }
                    else if (artclDbNm === "pstCn" || detailCmp.type === "editType1") {
                        let contentNode = null;
                        let template = document.createElement("template");
                        if (artclDbNm === "pstCn") {
                            //value = pstData.lcpctyArtclInptYn === "Y" ? pstData.artclLcpctyInptCn : pstData.pstCn;

                            //게시물내용 노드
                            contentNode = this.view.reply.querySelector(`[data-tboard-fld-id="pstCn"]`);
                        }
                        else if (detailCmp.type === "editType1") {
                            //value = value;

                            //에디터 노드
                            let editNodes = this.view.reply.querySelectorAll(`[data-tboard-fld-type="dtlFld.editType1"]`);
                            editNodes[editNodes.length - 1].after(detailCmp.node);
                            contentNode = detailCmp.node;
                        }
                        value = value.replace(/\n/g, "<br>");
                        template.innerHTML = value;
                        contentNode.appendChild(template.content);
                        //TODO css 수정 필요
                        contentNode.style.wordBreak = "break-word";
                        //초기화
                    }
                    else if (detailCmp.type === "defaultType1") {
                        detailCmp.node.dataset.tboardId = artclNo;
                        let tboardFldType = detailCmp.node.dataset.tboardFldType;
                        let grpKey = tboardFldType.split(".")[0];
                        
                        value = this.bbsDfArtcl.applyMaskByArtclNo(artclNo, value, mask);

                        let grpNode = this.view.reply.querySelector(`[data-tboard-fld-grp="${grpKey}"]`);
                        if (grpNode.querySelector(`[data-tboard-id="${artclNo}"]`)) {
                            grpNode.querySelector(`[data-tboard-id="${artclNo}"]`).textContent = value;
                        }
                        else {
                            grpNode.appendChild(detailCmp.node);
                            detailCmp.node.textContent = value;
                        }
                    }
                    else if (detailCmp.type === "defaultType2") {
                        detailCmp.node.dataset.tboardId = artclNo;
                        let tboardFldType = detailCmp.node.dataset.tboardFldType;
                        let grpKey = tboardFldType.split(".")[0];
                        
                        value = this.bbsDfArtcl.applyMaskByArtclNo(artclNo, value, mask);

                        value = `${artclKrNm}: ${value}`;
                        let grpNode = this.view.reply.querySelector(`[data-tboard-fld-grp="${grpKey}"]`);
                        if (grpNode.querySelector(`[data-tboard-id="${artclNo}"]`)) {
                            grpNode.querySelector(`[data-tboard-id="${artclNo}"]`).textContent = value;
                        }
                        else {
                            grpNode.appendChild(detailCmp.node);
                            detailCmp.node.textContent = value;
                        }
                    }
                    else if (detailCmp.type === "defaultType3") {

                    }
                    else if (detailCmp.type === "atchType1") {
                        //항목 별 첨부파일로 분리
                        let atchFileList = atcflData.filter( _data => {return _data.bbsAtcflNo.indexOf(detailCmp.artclInfo.artclNo) > -1});
                        if (atchFileList.length < 1) {
                            return;
                        }
                        
                        let fileGrpNode  = this.view.reply.querySelectorAll(`[data-tboard-fld-grp="atchFld"]`);
                        let lastFileNode = fileGrpNode[fileGrpNode.length - 1];
                        
                        //기본 첨부파일
                        let procNode = this.view.reply.querySelector(`[data-tboard-artcl-no=${artclNo}]`);
                        if (!procNode) {
                            procNode = detailCmp.node;
                            procNode.dataset.artclNo = artclNo;

                            let fileInfoNode   = null;
                            let btnAllDownNode = null;
                            if (!procNode.querySelector(`[data-tboard-fld-type="atchFld.info"]`)) {
                                fileInfoNode = tboardMng.elements.detailType1.atchFld.info.cloneNode(true);
                                procNode.appendChild(fileInfoNode);
                            }

                            if (!procNode.querySelector(`[data-tboard-fld-type="atchFld.btnAll"]`)) {
                                btnAllDownNode =  tboardMng.elements.detailType1.atchFld.btnAll.cloneNode(true);
                                procNode.appendChild(btnAllDownNode);

                                btnAllDownNode.addEventListener("click", () => {
                                    let fileDown = {
                                        pstNo: pstData.pstNo
                                        , artclNo: artclNo
                                        , bbsAtcflNo: "all"
                                        , pstNm: pstData.pstNm
                                        , fileNm: ""
                                    }
                                    this.bbsEvent.fileDownload(fileDown);
                                });
                            }
                        }

                        //파일건수
                        procNode.querySelector(`[data-tboard-fld-id="atchCnt"]`).textContent = atchFileList.length;

                        //item 삭제
                        procNode.querySelectorAll(`[data-tboard-fld-type="atchFld.item"]`).forEach(_node => {
                            _node.remove();
                        })

                        //item 추가
                        for (const fileInfo of atchFileList) {
                            let fileName = fileInfo.bbsOrgnlAtcflNm;
                            let fileSize = tboardUtil.formatBytes(fileInfo.bbsAtcflSz);
                            let dispValue = `${fileName} [${fileSize}]`;
                            
                            let fileItem = tboardMng.elements.detailType1.atchFld.item.cloneNode(true);
                            fileItem.querySelector(`[data-tboard-fld-id="atchFileNm"]`).textContent = dispValue;

                            let btnDown = fileItem.querySelector("button");
                            btnDown.addEventListener("click", () => {
                                let fileDown = {
                                    pstNo: pstData.pstNo
                                    , artclNo: artclNo
                                    , bbsAtcflNo: fileInfo.bbsAtcflNo
                                    , pstNm: pstData.pstNm
                                    , fileNm: fileInfo.bbsOrgnlAtcflNm
                                }
                                this.bbsEvent.fileDownload(fileDown);
                            });

                            detailCmp.node.appendChild(fileItem);
                        }

                        lastFileNode.after(detailCmp.node);
                    }

                });

                //답변 영역 삭제
                let replyNodes = rootNode.querySelectorAll("[data-tboard-type='reply']");
                replyNodes.forEach( _node => _node.remove() );
                
                //답변 생성위치 기준
                let replyArea = rootNode.querySelector("[data-tboard-id='replyView']");

                //답변 추가
                while(this.view.reply.lastChild) {
                    if (this.view.reply.lastChild.nodeType === 1) {
                        this.view.reply.lastChild.dataset.tboardType = "reply";   
                        replyArea.after(this.view.reply.lastChild);
                    }
                    else {
                        this.view.reply.lastChild.remove();
                    }
                }
            }
            else if (_type === "writeType1") {
                let pstData     = _data.pstInfo; //게시물데이터
                let atcflData   = _data.atcflInfo; //첨부데이터
                let artclData   = _data.artclInfo; //항목데이터

                //등록 영역
                let writeAreaNode = this.view.write.querySelector("[class='tboard_write_con']");

                //순서대로
                let widthCtl   = 0;
                let objConfig  = this.bbsArtcl.user.ctl.write;
                let cmpSortSeq = Object.keys(this.bbsArtcl.user.ctl.write.sort).sort((a, b) => Number(a) - Number(b));

                cmpSortSeq.forEach( _key => {
                    let artclNo   = objConfig.sort[_key]; //항목번호
                                        
                    //화면에 그릴 컴포넌트
                    let component = this.bbsArtcl.cmp.write.artcl[ artclNo ];

                    //최초에 한번 등록                    
                    if (!component.isAppended) {
                        //로우
                        let rowNode = tboardMng.elements.writeType1.writeFld.root.cloneNode(true);
                        
                        if (component.subType === "notice") {
                            let noticeRow = this.view.write.querySelector(`[data-tboard-fld-id="notice"]`);
                            if (noticeRow instanceof HTMLElement) {
                                rowNode = noticeRow;
                            }
                            else {
                                writeAreaNode.appendChild(rowNode);
                            }
                            rowNode.dataset.tboardFldId = "notice";
                            rowNode.appendChild(component.formEl.checkItem);
                            rowNode.appendChild(component.formEl.inputItem);

                            if (component.indctYn !== "Y") {
                                rowNode.style.display = "none";
                            }
                        }
                        else if (component.subType === "secret") {
                            rowNode.appendChild(component.formEl.radioItem);                        
                            writeAreaNode.appendChild(rowNode);

                            if (component.indctYn !== "Y") {
                                component.formEl.radioItem.style.display = "none";
                            }
                        }
                        else {
                            //로우에 추가 될 등록 화면 사용 컴포넌트 아이템
                            let itemNode = component.node;
                            itemNode.dataset.tboardArtclNo = artclNo;

                            //objConfig
                            let isFull = true;
                            if (isFull) {
                                writeAreaNode.appendChild(rowNode).appendChild(itemNode);
                                widthCtl = 0;
                            }
                            else {
                                widthCtl = widthCtl + 50
                                if (widthCtl % 100 === 50) {
                                    //마지막(tboard_search_row)노드의 마지막 tboard_search_item 삭제 후 append
                                }
                                else {
                                    writeAreaNode.appendChild(rowNode).appendChild(itemNode);
                                }
                            }

                            if (component.indctYn !== "Y") {
                                itemNode.style.display = "none";
                            }
                        }
                        component.isAppended = true;
                    }
                    else {
                        if (component.ctlInfo.optType === "pstNm") {
                            if (component.indctYn === "Y") {
                                component.node.style.display = "";
                            }
                            else {
                                component.node.style.display = "none";
                            }                  
                        }
                    }

                    let artclDbNm  = this.bbsDfArtcl.get(artclNo);
                    let artclValue = "";
                    let value      = "";

                    //등록화면
                    if (_data.isWriteMode === true) {

                        let userInitValue = this.bbsUser.writeInfo[artclNo];
                        value = component.ctlInfo.ini || userInitValue || "";

                        if (userInitValue) {
                            component.setStyle({readonly:"true"});
                        }
                    }
                    //수정
                    else {
                        if (artclData[artclNo]) {
                            artclValue = artclData[artclNo].lcpctyArtclInptYn === "Y" ? artclData[artclNo].artclLcpctyInptCn : artclData[artclNo].artclInptCn;
                        }
                        //제목,내용 등 기본값
                        value = (artclDbNm) ? pstData[artclDbNm] || "" : artclValue || "";
                        
                        if (component.subType === "notice") {
                            value = {pstSeCd: pstData.pstSeCd, pstSortSeq: pstData.pstSortSeq};
                        }
                        else if (component.type === "atchType1" || component.subType === "thumb") {
                            value = JSON.parse(JSON.stringify(atcflData.filter(_data => {
                                return (_data.bbsAtcflNo.indexOf(artclNo) > -1);
                            })));
                        }
                    }

                    //if (component.indctYn !== "Y") {
                      //  component.node.style.display = "none";
                    //}
                    
                    //데이터 셋팅
                    component.setInitValue(value);
                });

                if (rootNode.firstElementChild instanceof Node) {
                    //이전화면 백업
                    this.viewTemp.prevPage = rootNode.firstElementChild.cloneNode(true);
                    rootNode.firstElementChild.remove();
                }

                rootNode.append(this.view.write);
            }     
            else if (_type === "writeType1.reply") {
                let pstData     = _data.pstInfo; //게시물데이터
                let atcflData   = _data.atcflInfo; //첨부데이터
                let artclData   = _data.artclInfo; //항목데이터

                //등록 영역
                let writeAreaNode = this.view.writeReply.querySelector("[class='tboard_write_con']");

                //순서대로
                let objConfig  = this.bbsArtcl.user.ctl.writeReply;
                let cmpSortSeq = Object.keys(this.bbsArtcl.user.ctl.writeReply.sort).sort((a, b) => Number(a) - Number(b));
                let rowNode = null;
                cmpSortSeq.forEach( _key => {
                    let artclNo   = objConfig.sort[_key]; //항목번호

                    //화면에 그릴 컴포넌트
                    let component = this.bbsArtcl.cmp.writeReply.artcl[ artclNo ];

                    //매핑 값
                    let artclDbNm  = this.bbsDfArtcl.get(artclNo);
                    let title      = component.ctlInfo.title;
                    let hide       = component.ctlInfo.hide;

                    //item width
                    let width      = 100;
                    if (isNaN(component.ctlInfo.width) === false) {
                        width = Number(component.ctlInfo.width || 100);
                    }
                    width = ["pstNm", "pstCn"].includes(artclDbNm) ? 100 : width;

                    //최초에 한번 등록
                    if (!component.isAppended) {
                        //로우 생성여부
                        let isNewRow = true;
                        if (rowNode === null) {
                            rowNode = tboardMng.elements.writeType1.writeFld.root.cloneNode(true);
                        }
                        else if(!width || width === 0 || width === 100) {
                            rowNode = tboardMng.elements.writeType1.writeFld.root.cloneNode(true);
                            width = 100;
                        }
                        else {
                            let sumWidth = 0;
                            rowNode.childNodes.forEach(itemEl => {
                                let iWidth = 0;    
                                try {
                                    iWidth = Number(itemEl.dataset.tboardWidth);
                                }
                                catch(error) {
                                    iWidth = 0;
                                }
                                sumWidth = sumWidth + iWidth;
                            });
                            if (sumWidth + width > 100) {
                                rowNode = tboardMng.elements.writeType1.writeFld.root.cloneNode(true);
                            } else {
                                isNewRow = false;
                            }
                        }

                        let itemEl = null;
                        if (component.subType === "secret") {
                            itemEl = component.formEl.radioItem;
                        }
                        else {
                            itemEl = component.node;
                        }

                        //명칭설정 있으면
                        if (title) {
                            itemEl.querySelector(`[class="tboard_write_label"]`).textContent = title;
                        }
                        if (hide === "Y" || component.indctYn !== "Y") {
                            itemEl.style.display = "none";
                        }

                        itemEl.dataset.tboardArtclNo = artclNo;
                        itemEl.dataset.tboardWidth = width;
                        rowNode.appendChild(itemEl);
                        if (isNewRow === true) {
                            writeAreaNode.appendChild(rowNode);
                        }
                        component.isAppended = true;
                    }

                    let value      = "";
                    let artclValue = "";
                    if (_data.isWriteMode === false) {
                        if (artclData[artclNo]) {
                            artclValue = artclData[artclNo].lcpctyArtclInptYn === "Y" ? artclData[artclNo].artclLcpctyInptCn : artclData[artclNo].artclInptCn;
                        }
                        //제목,내용 등 기본값
                        value = (artclDbNm) ? pstData[artclDbNm] || "" : artclValue || "";
                        
                        if (component.subType === "notice") {
                            value = {pstSeCd: pstData.pstSeCd, pstSortSeq: pstData.pstSortSeq};
                        }                        
                        else if (component.type === "atchType1" || component.subType === "thumb") {
                            value = JSON.parse(JSON.stringify(atcflData.filter(_data => {
                                return (_data.bbsAtcflNo.indexOf(artclNo) > -1);
                            })));
                        }
                    }
                    else {
                        value = component.ctlInfo.ini || "";
                    }
                    
                    if (component.ctlInfo.viewonly === "Y") {
                        value = this.bbsDfArtcl.applyMaskByArtclNo(artclNo, value, component.ctlInfo.mask);
                    }

                    //그 다음 화면 오픈 시 값 만 초기화
                    component.setInitValue(value);
                }); //loop component

                //상위 게시글 표시
                if (this.bbsAuth.isShowUpPst()) {
                    this.showUpPst(_data);
                }

                if (rootNode.firstElementChild instanceof Node) {
                    //이전화면 백업
                    this.viewTemp.prevPage = rootNode.firstElementChild.cloneNode(true);
                    rootNode.firstElementChild.remove();
                }

                rootNode.append(this.view.writeReply);
            }
        }

        showUpPst(_data) {
            let upPstTemplateEl = document.createElement("template");
            this.bbsArtcl.cmp.writeReply.upPst = this.bbsArtcl.cmp.writeReply.upPst || {};            
            let writeAreaNode = this.view.writeReply.querySelector("[class='tboard_write_con']");

            let orgnPstData = _data.orgnPstInfo;
            let pstData     = orgnPstData.pstInfo; //게시물데이터
            let atcflData   = orgnPstData.atcflInfo; //첨부데이터
            let artclData   = orgnPstData.artclInfo; //항목데이터

            //상세정보 내용 입력 시 표시
            let defaultConfig = this.bbsDfArtcl.getDefaultArtclCtl({writeDetail: "writeDetailType1"});
            let objConfig  = this.bbsArtcl.user.ctl.detail;
            let cmpSortSeq = Object.keys(objConfig.sort).sort((a, b) => Number(a) - Number(b));
            cmpSortSeq.forEach( _key => {
                let artclNo = objConfig.sort[_key];
                if (this.bbsDfArtcl.get(artclNo)) {
                    return;
                }
                let index = Number(_key) + 10;
                defaultConfig.writeDetail.sort[index] = artclNo;
                defaultConfig.writeDetail.control[artclNo] = objConfig.control[artclNo];
            });

            console.log(defaultConfig.writeDetail.control);
            console.log(defaultConfig.writeDetail.sort);

            let rowNode = null;
            cmpSortSeq = Object.keys(defaultConfig.writeDetail.sort).sort((a, b) => Number(a) - Number(b));
            cmpSortSeq.forEach( _key => {
                let artclNo = defaultConfig.writeDetail.sort[_key];
                let ctlInfo = defaultConfig.writeDetail.control[artclNo]; //항목설정
                let dtlComp = this.bbsArtcl.cmp.detail.artcl[artclNo];

                let mask       = ctlInfo.mask;
                let artclNm    = dtlComp.artclNm;
                let artclDbNm  = this.bbsDfArtcl.get(artclNo);
                let value      = "";
                let width      = ["pstNm", "pstCn"].includes(artclDbNm) ? 100 : 50;

                if (artclDbNm) {
                    value = pstData[artclDbNm] || "";
                    console.log(" ===>")
                }
                else if (artclData[artclNo]) {
                    value = artclData[artclNo].lcpctyArtclInptYn === "Y" ? artclData[artclNo].artclLcpctyInptCn : artclData[artclNo].artclInptCn;
                }
                
                if (ctlInfo.src && ctlInfo.cct) {
                    value = this.bbsComGrpCd.getCodeNm(ctlInfo.cct, ctlInfo.src, value);
                }
                else {
                    //마스크
                    value = this.bbsDfArtcl.applyMaskByArtclNo(artclNo, value, mask);
                }

                if (!this.bbsArtcl.cmp.writeReply.upPst[artclNo]) {
                    //
                    let compEl = tboardMng.elements.writeType1.writeFld[ "inputType1" ].cloneNode(true);
                    //라벨(항목명)
                    let labelEl = compEl.querySelector(`[class="tboard_write_label"]`);
                    let labelName = artclNm;
                    if (labelEl) {                        
                        if (artclDbNm === "pstNm") {
                            labelName = "질문제목";
                        }
                        else if (artclDbNm === "pstCn") {
                            labelName = "질문내용";
                        }
                        labelEl.textContent = labelName;
                    }

                    if (artclDbNm === "pstCn") {
                        let contentEl = compEl.querySelector(`[class="tboard_write_input"]`);
                        while(contentEl.firstChild) {
                            contentEl.firstChild.remove();
                        }
                        //에디터 생성영역
                        contentEl.style.display = "grid";
                        contentEl.style.gridTemplateColumns = "1fr";
        
                        let editorDiv = document.createElement("div");
                        editorDiv.dataset.tboardArtclNo = "orgnPstCn";
                        editorDiv.style.backgroundColor = "#f0f0f0";
                        editorDiv.style.borderColor = "#f0f0f0";
                        contentEl.appendChild(editorDiv);

                        //에디터 생성
                        let editor = new Quill(editorDiv, {theme: "snow", readOnly: true, modules : {toolbar:false}});
                        editor.container.dataset.tboardEl = "Y";
                        editor.container.querySelector(".ql-editor").dataset.tboardEl = "Y";
                        editor.root.innerHTML = "";
                        if (value) {
                            let template = document.createElement("template");
                            template.innerHTML = value;
                            editor.root.appendChild(template.content);
                        }

                        this.bbsArtcl.cmp.writeReply.upPst[artclNo] = this.bbsArtcl.cmp.writeReply.upPst[artclNo] || {};
                        this.bbsArtcl.cmp.writeReply.upPst[artclNo].editor = editor;
                        this.bbsArtcl.cmp.writeReply.upPst[artclNo].type = "editType1";
                        editor.root.dataset.tboardArtclNo = `orgn${artclNo}`;
                    }
                    else {
                        let inputEl = compEl.querySelector("input");
                        inputEl.title = labelName;
                        inputEl.setAttribute("placeholder", `${labelName}을 입력하세요.`);
                        inputEl.setAttribute("readonly", true);
                        inputEl.style.backgroundColor   = "#f0f0f0";
                        inputEl.style.borderColor       = "#f0f0f0";
                        inputEl.value = value;
                        inputEl.dataset.tboardArtclNo = `orgn${artclNo}`;

                        this.bbsArtcl.cmp.writeReply.upPst[artclNo] = this.bbsArtcl.cmp.writeReply.upPst[artclNo] || {};
                        this.bbsArtcl.cmp.writeReply.upPst[artclNo].formEl = inputEl;
                        this.bbsArtcl.cmp.writeReply.upPst[artclNo].type = "inputType1";
                    }
                    
                    //추가
                    let isNewRow = true;
                    if (rowNode === null) {
                        rowNode = tboardMng.elements.writeType1.writeFld.root.cloneNode(true);
                    }
                    else if(width === 100) {
                        rowNode = tboardMng.elements.writeType1.writeFld.root.cloneNode(true);
                    }
                    else {
                        let sumWidth = 0;
                        rowNode.childNodes.forEach(itemEl => {
                            let iWidth = 0;    
                            try {
                                iWidth = Number(itemEl.dataset.tboardWidth);
                            }
                            catch(error) {
                                iWidth = 0;
                            }
                            sumWidth = sumWidth + iWidth;
                        });
                        if (sumWidth + width > 100) {
                            rowNode = tboardMng.elements.writeType1.writeFld.root.cloneNode(true);
                        } else {
                            isNewRow = false;
                        }
                    }
                    //witdh값
                    compEl.dataset.tboardWidth = width;
                    rowNode.appendChild(compEl);
                    if (isNewRow === true) {
                        upPstTemplateEl.appendChild(rowNode);
                    }
                }
                else {
                    if (this.bbsArtcl.cmp.writeReply.upPst[artclNo].type === "inputType1") {
                        let formEl = this.bbsArtcl.cmp.writeReply.upPst[artclNo].formEl;
                        formEl.value = value;
                    }
                    else if (this.bbsArtcl.cmp.writeReply.upPst[artclNo].type === "editType1") {
                        let template = document.createElement("template");
                        template.innerHTML = value;
                        this.bbsArtcl.cmp.writeReply.upPst[artclNo].editor.root.innerHTML = "";
                        this.bbsArtcl.cmp.writeReply.upPst[artclNo].editor.root.appendChild(template.content);
                    }
                }
            });

            while(upPstTemplateEl.lastChild) {
                writeAreaNode.insertBefore(upPstTemplateEl.lastChild, writeAreaNode.firstChild);
            }
        }


        getSearchResultData(_pstNo) {
            if (Object.keys(this.result.search).length < 1) {
                return {};
            }
            
            let rtnData = {};
            try {
                let baseData = this.result.search.baseList.filter(data => {return data.pstNo === _pstNo});
                let pstData  = this.result.search.pstList.filter(data => {return data.pstNo === _pstNo});
                rtnData = {...baseData[0], ...pstData[0]};
            }
            catch(error) {
                return rtnData;
            }
            return rtnData;
        }

        getSearchResultList() {


        }

        async getPrevAndNextPstNo(_pstNo) {

            let rtnData = {
                prevPstNo: "none"
                , nextPstNo: "none"
                , prevPstNm: ""
                , nextPstNm: ""
            }
            
            if (Object.keys(this.result.search).length < 1) {
                return rtnData;
            }
            //let pstData   = this.getSearchResultData(_pstNo);
            let totalPage = this.bbsArtcl.tboardInstance.bbsPaging.getTotalPageNo();
            let curPageCo = this.bbsArtcl.tboardInstance.bbsPaging.getCurrentPageNo();
            
            //let prevNum = ((Number(pstData.rnum) - 1) );
            //let nextNum = ((Number(pstData.rnum) + 1) );

            let crntIndex = this.result.search.baseList.findIndex(data => data.pstNo === _pstNo);
            let prevIndex = crntIndex - 1;
            let nextIndex = crntIndex + 1;

            let prevData = prevIndex < 0 ? {} : this.result.search.baseList[prevIndex];
            let nextData = nextIndex >= this.result.search.baseList.length ? {} : this.result.search.baseList[nextIndex];

            //첫페이지에 이전 값이 없는 경우
            if (curPageCo === 1 && Object.keys(prevData).length < 1) {
                rtnData.prevPstNo = "none";
            }
            else {
                rtnData.prevPstNo = prevData.pstNo;
            }
            
            //마지막페이지에 마지막 값이 없는 경우
            if (totalPage === curPageCo && Object.keys(nextData).length < 1) { //
                rtnData.nextPstNo = "none";
            } else {
                rtnData.nextPstNo = nextData.pstNo;
            }

            let prevPstData = {}; 
            let nextPstData = {};
            let backUpPageCo = this.bbsPaging.getCurrentPageNo();
            if (!rtnData.prevPstNo && rtnData.prevPstNo !== "none") {
                this.bbsPaging.setCurrentPageNo( Number(backUpPageCo) - 1);
                
                //이전 페이지 조회
                prevPstData = await this.bbsEvent.searchData();

                //prevData = prevPstData.baseList.filter(data => {return data.rnum === String(prevNum)});
                let tempList = prevPstData?.baseList || [];
                prevData = (tempList.length > 0) ?  tempList[tempList.length-1] : {};

                //이전 게시물 번호
                rtnData.prevPstNo = prevData.pstNo;
            }
            else if (!rtnData.nextPstNo && rtnData.nextPstNo !== "none") {                
                this.bbsPaging.setCurrentPageNo( Number(backUpPageCo) + 1);

                //다음 페이지 조회
                nextPstData = await this.bbsEvent.searchData();
                let tempList = nextPstData?.baseList || [];
                nextData = (tempList.length > 0) ?  tempList[0] : {};

                //다음 게시물 번호
                rtnData.nextPstNo = nextData.pstNo;
            }

            this.bbsPaging.setCurrentPageNo(backUpPageCo)
            for (const pstData of this.result.mergeSearch.pstList) {
                if (rtnData.prevPstNo === pstData.pstNo) {
                    rtnData.prevPstNm = pstData.pstNm;
                }
                else if (rtnData.nextPstNo === pstData.pstNo) {
                    rtnData.nextPstNm = pstData.pstNm;
                }
            }

            return rtnData;
        }

    },
    TboardTransaction = class { //화면 서비스
        constructor(_bbsInstance) {
            this.tAjax = new TboardAjaxManager();
            this.config = new TboardConfig().config;
            this.bbsInfo = _bbsInstance;
        }

        getTboardCommonInfo(_serviceId) {
            let commonInfo = {
                  systemCd: this.config.systemCd 
                , channel: this.bbsInfo.channel
                , bbsId: this.bbsInfo.bbsId
                , bbsGrpId: this.bbsInfo.bbsGrpId
                , serviceId: _serviceId
            }
            return commonInfo;
        }

        getAjaxSetting(_settingType) {
            let ajaxSetting = {
                default: {
                    url : ""
                    , type : "POST"
                    , dataType : "json"
                },
                multipart: {
                    url : ""
                    , type : "POST"
                    , dataType : "json"
                    , processData: false
                    , contentType: false
                }
            }
            return ajaxSetting[_settingType || "default"];
        }
        /*call(_setting) {
            this.tAjax.ajax(_setting);
        }*/

        /*successCallbackMap(type, _data) {
            if (type === "permission") {
                resolve();
            }
        }*/

        comCode(_data) {
            //console.log("      ====================> 1. 권한요청");
            return new Promise((resolve, reject) => {
                let setting = this.getAjaxSetting("default");

                setting.tboardCommonInfo = this.getTboardCommonInfo("comCode");
                setting.input = _data || {};
                setting.url = this.config.ajaxUrl.root + this.config.ajaxUrl.default;
                setting.successCallbackFn = (_data) => {
                    //console.log("      ====================> 1. 권한요청 결과 ", _data);
                    resolve(_data);
                }
                setting.errorCallbackFn = (error) => {
                    reject();
                }
                
                this.tAjax.ajax(setting);
            });
        }

        setBbsOption() {
            //게시판 권한저장
            this.bbsInfo.bbsAuth.setAuth(pmsnData.response.bbsFwkAll);
            
            //게시판 항목정보
            this.bbsInfo.bbsAuth.setBbsArtcl(pmsnData.response);
        }

        callAjax(_args) {
            return new Promise((resolve, reject) => {
                let settingType = _args.type || "default";
                let reqId = _args.reqId;
                let inputData = _args.data || {};
                let successCallbackFn = _args.scb;
                
                let setting = this.getAjaxSetting( settingType);
                if (settingType === "multipart") {
                    setting.isMultipart = true;
                    setting.formData = inputData.formData;
                    setting.input    = inputData.input || {};
                } else {
                    setting.input = inputData;
                }

                setting.tboardCommonInfo = this.getTboardCommonInfo( reqId );                
                setting.url = this.config.ajaxUrl.root + this.config.ajaxUrl [ settingType ] ;
                setting.successCallbackFn = (_result) => {
					//console.log(reqId, _result);
					if (_result.code !== 0) {
						let msgCode = "";
						let message = "";
						if (_result.subMessage && _result.subMessage.indexOf("msg_") > -1) {
							msgCode = _result.subMessage;
						}
						message = tboardMsg.getMsg(msgCode || "msg_999");
						//todo
						alert(message);
						reject(_result);
						return;
					}
                    resolve(_result);
                    if (typeof successCallbackFn === "function") {
                        successCallbackFn(_result);
                    }                    
                }
                setting.errorCallbackFn = (error) => {
                    let message = tboardMsg.getMsg("msg_999");
                    alert(message);                    
                    reject("tboard error");
                }

                this.tAjax.ajax(setting);
            }); 
        }


        getBbsDefaultInfo(_data) {
            let ajaxConfig = {
                type: "default"
                , reqId: "getBbsDefaultInfo"
                , data: _data || {}
            };            
            return this.callAjax(ajaxConfig);
        }
        
        basicAccess(_data) {
            let ajaxConfig = {
                type: "default"
                , reqId: "basicAccess"
                , data: _data || {}
            };
            return this.callAjax(ajaxConfig);
        }

        basicRead(_data) {
            let ajaxConfig = {
                type: "default"
                , reqId: "basicRead"
                , data: _data || {}
            };
            return this.callAjax(ajaxConfig);
        }

        basicWrite(_data) {
            let ajaxConfig = {
                type: "multipart"
                , reqId: "basicWrite"
                , data: _data || {}
            };
            return this.callAjax(ajaxConfig);
        }

        basicDelete(_data) {
            let ajaxConfig = {
                type: "default"
                , reqId: "basicDelete"
                , data: _data || {}
            };
            return this.callAjax(ajaxConfig);
        }

        replyAccess() {
            let ajaxConfig = {
                type: "default"
                , reqId: "replyAccess"
                , data: _data || {}
            };
            return this.callAjax(ajaxConfig);
        }

        replyRead(_data) {
            let ajaxConfig = {
                type: "default"
                , reqId: "replyRead"
                , data: _data || {}
            };
            return this.callAjax(ajaxConfig);
        }

        //replyWrite.tx
        replyWrite(_data) {
            let ajaxConfig = {
                type: "multipart"
                , reqId: "replyWrite"
                , data: _data || {}
            };
            return this.callAjax(ajaxConfig);            
        }

        replyDelete(_data) {
            let ajaxConfig = {
                type: "default"
                , reqId: "replyDelete"
                , data: _data || {}
            };
            return this.callAjax(ajaxConfig);
        }

        getImageFromBase64(_args) {
            let ajaxConfig = {
                type: "default"
                , reqId: "getThumbImageBase64"
                , data: {thumbInfo: _args.data || {}}
                , scb : _args.scb
            };
            return this.callAjax(ajaxConfig);
        }

        commentDetail() {
        }
        commentSave() {
        }
        commentDelete() {
        }

        commentReplyDetail() {
        }
        commentReplySave() {
        }
        commentReplyDelete() {
        }

        fileDownload(_data) {
            return new Promise((resolve, reject) => {
                let fileDownData = _data;

                let setting = this.getAjaxSetting("default"); 
                setting.tboardCommonInfo = this.getTboardCommonInfo("fileDownload");
                setting.input = _data || {};
                setting.url   = this.config.ajaxUrl.root + this.config.ajaxUrl.default;
                setting.successCallbackFn = (_data) => {
                    if (_data.subMessage === "msg_916") {
                        tboardUtil.commonAlert( tboardMsg.getMsg(_data.subMessage) );
                        return;
                    }

                    //console.log("      ====================> 1. 조회 결과 ", _data);
                    if (_data.code !== 0 || (Object.keys(_data.response.fileDownInfo).length < 1)) {                  
                        let msgCode = "msg_908";
                        throw new Error("detail error : " + tboardMsg.getMsg(msgCode));
                    }

                    let data = _data.response.fileDownInfo.data || "";
                    let key  = _data.response.fileDownInfo.key || "";
                    let filedownUrl = "";
                    if (this.bbsInfo.channel === "app") {
                        filedownUrl = `${tboardConfig.ajaxUrl.root}${tboardConfig.ajaxUrl.filedown}?data=${data}&key=${key}`;
                    } else {
                        filedownUrl = `${tboardConfig.ajaxUrl.root}${tboardConfig.ajaxUrl.filedown}?data=${data}&key=${key}`;
                    }
                    window.location.href = filedownUrl;
                    resolve();
                    
                    /*filedownUrl = `${tboardConfig.ajaxUrl.root}${tboardConfig.ajaxUrl.filedown}?data=${data}&key=${key}`;
                    let downSetting = {
                        url : filedownUrl
                        , type : "GET"
                        , successCallbackFn : function(_data) {
                            let fileDownNm = "";
                            if (fileDownData.bbsAtcflNo === "all") {
                                fileDownNm = fileDownData.pstNm + ".zip";
                            }
                            else {
                                fileDownNm = fileDownData.fileNm;
                            }
                            const blob = new Blob([_data]);
                            const link = document.createElement("a");
                            const url  = window.URL.createObjectURL(blob); 
                            link.href = url;
                            link.download = fileDownNm;
                            link.click();
                            window.URL.revokeObjectURL();
                        }
                    }
                    this.tAjax.ajax(downSetting);
                
                    //window.location.href = filedownUrl;
                    */

                }
                setting.errorCallbackFn = (error) => {
                    reject();
                }
                
                this.tAjax.ajax(setting);
            });
        }
        getUrlMap() {

        }
    },

    TboardImgUtil = class {
        static instance;
        constructor() {
            //값이 있으면 기존값 리턴
            if (TboardImgUtil.instance) {
                return TboardImgUtil.instance;
            }
            //값이 없으면 생성 객체 입력
            TboardImgUtil.instance = this;
        }


        async imageConversion(file) {
            let resultObj = new Object();
            let imgBase64 = null;
            let exifObj = null;
            let image = null;
            let fileExt = file.name.split('.').pop().toLowerCase();
            try {
                image = await this.getImage(file);	
                let baseWidth  = image.width;
                let baseHeight = image.height;

                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                let targetSize = this.imageResize(baseWidth, baseHeight);
                canvas.width  = targetSize.width;
                canvas.height = targetSize.height;
                ctx.drawImage(image, 0, 0, targetSize.width, targetSize.height);
                   
                imgBase64 = canvas.toDataURL('image/*');
                imgBase64 = imgBase64.replace(/^data:image\/[a-z]+;base64,/, "");
                
                exifObj = this.getExifData(image);
                
                resultObj.convBase64 = imgBase64;
                resultObj.exifData   = JSON.stringify(exifObj);
                resultObj.fileExt    = fileExt;
                resultObj.fileNm     = file.name;
                resultObj.fileSize   = tboardImgUtil.getBase64ImageSize(imgBase64);

                //formData.append('object',JSON.stringify(resultObj));
                //formData.append('fileExt',fileExt);
                //formData.append('fileNm',file.name);
                /*
                fetch("/processImg.do",{
                    method : "POST",
                    body : formData
                }).then((response)=> response.json())
                .then((data)=> {console.log("DATA:",data)})
                .catch((error)=> {console.log("ERROR : ",error)});
                */

                return resultObj;
                
            } catch(error) {
                console.log("ERROR: ",error);
            }
        }

        getImage(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = function(e){
                    const img = new Image();
                    
                    img.onload = function(){
                        //console.log(img);
                        resolve(img);
                    };
                    
                    img.onerror = function(){
                        reject(new Error("이미지 로드 실패"));
                    }
                    
                    img.src = e.target.result;
                };
                reader.readAsDataURL(file);
            });
        }

        imageResize(baseWidth, baseHeight){
            let targetSize = {
                width : baseWidth
                ,height : baseHeight
            }
            
            let imgType;
            let reSizeValue;
            if(baseWidth >= baseHeight){
                reSizeValue = 1100;
                imgType = "H";
            }
            else{
                reSizeValue = 2000;
                imgType = "V";
            }
            
            let tempSize = baseHeight;
            
            var targetWidth = baseWidth;   // 원하는대로 설정. 픽셀로 하려면 maxWidth = 100  이런 식으로 입력
            var targetHeight = baseHeight;   // 원래 사이즈 * 0.5 = 50%
            
            let isResize = false;
            while( tempSize >= reSizeValue)	{
                isResize = true;
                tempSize = tempSize * 0.7; 
                targetWidth = targetWidth * 0.7;
                targetHeight = targetHeight * 0.7;
            }
            
            if(isResize == true) {
                targetWidth = Math.round(targetWidth);
                targetHeight = Math.round(targetHeight);
                // 가로, 세로 최대 사이즈 설정
        
        
                // 가로가 세로보다 크면 가로는 최대사이즈로, 세로는 비율 맞춰 리사이즈
                  if(imgType === "V"){
                    targetSize.height = targetHeight;
                    targetSize.width = Math.round((baseWidth * targetHeight) / baseHeight);
                }
                else {
                    targetSize.width = targetWidth;
                    targetSize.height = Math.round((baseHeight * targetWidth) / baseWidth);
                }    
           }
           return targetSize;
        }

        getExifData(img){
            //console.log(img);
            let tmp = null;
            let exifObj = new Object();
            const decoder = new TextDecoder("utf-8");
            EXIF.getData(img, function() {
                exifObj = EXIF.getAllTags(img);
                for (const key in exifObj) {
                    if (typeof exifObj[key] === 'string'){
                        tmp = new Uint8Array(exifObj[key].split('').map(ch => ch.charCodeAt(0)));
                        exifObj[key] = decoder.decode(tmp);
                    }
                }
                //console.log("EXIF OBJECT : ", exifObj);
            });

            return exifObj;
        }
        
        getBase64ImageSize(base64) {
            const imgBase64 = base64.replace(/^data:image\/[a-z]+;base64,/, "");
            const padding = (imgBase64.match(/=/g)||[]).length;
            const byteSize = (imgBase64.length * 3) / 4 - padding;
            return byteSize;
        }

    },


    TboardUtil = class {
        static instance;
        #uuidSeq = 1;
        constructor(_tboardType) {
            //값이 있으면 기존값 리턴
            if (TboardUtil.instance) {
                return TboardUtil.instance;
            }
            //값이 없으면 생성 객체 입력
            TboardUtil.instance = this;
        }

        uuidGen() {
            let time = new Date().getTime();
            let uuid = String(time) + this.#uuidSeq;
            this.#uuidSeq ++;
            return uuid;            
        }

        sort() {
        }

		commonAlert(msg, callback) {
			alert(msg);
			
			if (typeof callback === "function") {
				callback();
			}
		}

        numFormat(value) {
			if (!value) {
				return "";
			}
			return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g,",");
		}

        strRpad(str, length, padChar = " ") {
            str = str || "";
            if (str.length >= length) return str;
            const padding = padChar.repeat(length - str.length);
            return str + padding;
        }

        formatNumber(value) {
            if (!value) return "";
            return value.replace(/\D/g, "");
        }
        

        formatPhoneNumber(value) {
            if (!value) return "";
            
            const numbers = value.replace(/\D/g, "");
            if (numbers.length <= 3) {
                return numbers;
            }
            else if (numbers.length <= 7) {
                return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
            }
            else if (numbers.length <= 10) {
                return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
            }
            else {
                return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
            }
        }

        isValidPhoneNumber(value) {
            if (!value) return "";
            const numbers = value.replace(/\s+/g, "").replace(/-/g, "");
            const regex = /^(01[0-9])\d{7,8}$/;
            
            if (regex.test(numbers)) {
                return true;
            }
            return false;            
        }

        dateFormatMask(value, mask) {
            if (!value) {
				return "";
			}
            
            value = value.replace(/\D/g, "");
            value = this.strRpad(value, 14, "0");
            let year  = value.substr(0, 4);
            let month = value.substr(4, 2);
            let date  = value.substr(6, 2);
            let hour  = value.substr(8, 2);
            let min   = value.substr(10, 2);
            let sec   = value.substr(12, 2);

            if (mask === "yyyy") {
                return year;
            }
            else if (mask === "yyyy-mm") {
                return `${year}-${month}`;
            }
            else if (mask === "yyyy-mm-dd") {
                return `${year}-${month}-${date}`;
            }
            else if (mask === "yyyy-mm-dd hh24") {
                return `${year}-${month}-${date} ${hour}`;
            }
            else if (mask === "yyyy-mm-dd hh24:mi") {
                return `${year}-${month}-${date} ${hour}:${min}`;
            }
            else if (mask === "yyyy-mm-dd hh24:mi:ss") {
                return `${year}-${month}-${date} ${hour}:${min}:${sec}`;
            }
        }

		dateFormat(value, pattern) {
			if (!value) {
				return "";
			}

	        if(!pattern){
				pattern = "-";
			}

            if (value.length === 14) {
                value = value.replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, "$1"+pattern+"$2"+pattern+"$3" + " " +"$4" + ":" + "$5" + ":" + "$6");
                try {
                    const date = new Date(value);
                    if (isNaN(date.getTime())) {
                        value = "";
                    }
                }
                catch(error) {
                    value = "";
                }
                return value;
            }
            else if (value.length === 8) {
                value = value.replace(/(\d{4})(\d{2})(\d{2})/, "$1"+pattern+"$2"+pattern+"$3");

                try {
                    const date = new Date(value);
                    if (isNaN(date.getTime())) {
                        value = "";
                    }
                }
                catch(error) {
                    value = "";
                }
                return value;
            }
            else if (value.length === 6) {
                return value.replace(/(\d{4})(\d{2})/, "$1"+pattern+"$2");
            }

            return value;

			//return year + pattern + month + pattern + day;
		}

		getByteLength(_str, _koreanByte) {
			if (!_str || typeof _str !== "string") return;
			if (!_koreanByte || isNaN(Number(_koreanByte))) {
				_koreanByte = 2;
			}
			else if (Number(_koreanByte) < 1 || Number(_koreanByte) > 3) {
				_koreanByte = 2;
			}  
			
			let str = _str;
			let byteLength = 0;
			
			for (let i = 0; i < str.length; i++) {
				let charCode = str.charCodeAt(i);
				if (charCode <= 0x007F) {
					byteLength += 1; //ascii문자
				}
				else {
					byteLength += _koreanByte; //한글 및 그외문자 
				}
			}
			
			return byteLength;
		}

		formatBytes(bytes, decimals = 2) {
            let iBytes = 0;
            try {
                iBytes = Number(bytes);
            }
            catch(error) {
                iBytes = 0;
            }

		    if (iBytes === 0) return '0 Bytes';
		    const k = 1024;
		    const dm = decimals < 0 ? 0 : decimals;
		    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		
		    const i = Math.floor(Math.log(iBytes) / Math.log(k));
		
		    return parseFloat((iBytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
		}
		
        convertMBtoKB(mb) {
            return mb * 1024;
        }

        convertMBtoByte(mb) {
            return mb * 1024 * 1024;
        }

		possibleUploadFileSize(maxByte, chkBytes) {
			if (chkBytes > maxByte) {
				return false;
			}
            return true;
		}

        convertNumber(_number) {
            let number = 0;
            try {
                if (typeof _number === "number") {
                    number = _number;
                }
                else if (typeof _number === "string") {
                    number = Number(_number);
                }    
            } catch (error) {
                number = 0;
            }
            return number.toLocaleString("ko-KR");
        }

        checkDateBefore(dateString, beforeDay) {
            //beforeDay = beforeDay - 1;
            let year  = parseInt(dateString.slice(0, 4), 10);
            let month = parseInt(dateString.slice(4, 6), 10) - 1;
            let day   = parseInt(dateString.slice(6, 8), 10);

            let inputDate = new Date(year, month, day);

            let today = new Date();
            let diffDay = new Date(today);

            diffDay.setDate(today.getDate() - beforeDay);
            //console.log(diffDay.getDate());
            return inputDate >= diffDay;

        }


        deepFreeze(_object) {
            var propNames = Object.getOwnPropertyNames(_object);
            for (let name of propNames) {
                let value = _object[name];
                if (value && typeof value === "object") {
                    this.deepFreeze(value);
                }
            }
            return Object.freeze(_object);
        }

        getToday() {
            var date = new Date();
            var yy = String(date.getFullYear());
            var mm = String(date.getMonth() + 1);
            var dd = String(date.getDate());
            return yy + (mm.length == 1 ? "0" + mm : mm) +(dd.length == 1 ? "0" + dd : dd);
        }

        objectInit(target, path, object) {
            var tokens = path.split(".");
            for (var i = 0; i < tokens.length - 1; i++) {
                target[tokens[i]] = target[tokens[i]] || {};
                target = target[tokens[i]] || {};
            }
            target[tokens[tokens.length - 1]] = object;
        }

        getObjectData(target, path) {
            var tokens = path.split(".");
            for (var i = 0; i < tokens.length - 1; i++) {
                target[tokens[i]] = target[tokens[i]] || {};
                target = target[tokens[i]] || {};
            }
            
            return target[tokens[tokens.length - 1]] || "";
        }

        objectExtend(target, source) {
            if (!target) { target = {}; }
            if (!source) { source = {}; }  

            for (var prop in source) {
                if ( this.isObject( target[prop] )
                     && this.isObject( source[prop] )
                     && Object.keys( source[prop] ).length > 0 )
                {
                    this.objectExtend(target[prop], source[prop]);
                }
                else if (source.hasOwnProperty(prop)) {
                    target[prop] = source[prop];
                }
            }
            
            return target;
        }

        isDateString(_strValue) {
            let rtnData = false;
            try {
                const date = new Date(_strValue);
                rtnData = !isNaN(date.getTime);
            }
            catch(error) {
                rtnData = false
            }
            return rtnData;
        }

        isEmpty(_strValue) {
            if (typeof _strValue == "undefined" || _strValue == null || _strValue == "") {
                return true;
            }
            return false;
        }

        isObject(_object) {
            return (_object !== null
                    && typeof _object === 'object'
                    && 'constructor' in _object
                    && _object.constructor === Object);
        }

        isJsonObject(object) {
            try{
                if (typeof object !== "object") {
                    return false;
                }
                var jsonObject = JSON.parse(JSON.stringify(object));
                return (typeof jsonObject === 'object');
            }
            catch(e) {
                return false;
            }
        }
        
        isJsonString(str) {
            try{
                var jsonObject = JSON.parse(str);
                return (typeof jsonObject === 'object');
            }
            catch(e) {
                return false;
            }
        }
                
        isHtmlString(str) {
            try{
                var a = document.createElement('div');
                a.innerHTML = str;
                
                var c = a.childNodes;
                for (var i = c.length - 1; i >= 0; i--){
                    if (c[i].nodeType == 1) return true;
                }
            }
            catch(e) {
                return false;
            }
            
            return false;
        }
        
        arraySort(_array, _sortKey, _sortType) {
			if (!Array.isArray(_array) || _array.length < 1) {
				return _array;
			}
			
			let sortType = (_sortType === false) ? false : true;
			
			let objType = typeof _array[0];
			if (objType === "string") {
				return _array.sort((a, b) => 
					(sortType) ? a.localeCompare(b) : b.localeCompare(a) 
				);
			} else if (objType === "number") {
				return _array.sort((a, b) => 
					(sortType) ? a - b : b - a 
				);
			} else if (objType === "object") {
				if (!_sortKey || _array[0][_sortKey] === undefined) {
					return _array;
				} 
				
				return _array.sort((a, b) => {
					if (typeof a[_sortKey] === "string") {
						return (sortType) ? a[_sortKey].localeCompare(b[_sortKey]) : b[_sortKey].localeCompare(a[_sortKey]);
					} else if (typeof a[_sortKey] === "number") {
						return (sortType) ? a[_sortKey] - b[_sortKey] : b[_sortKey] - a[_sortKey];
					}
				});
			}
		}

    },
    TboardMsg = class {
        static instance;
        constructor(_tboardType) {
            //값이 있으면 기존값 리턴
            if (TboardMsg.instance) {
                return TboardMsg.instance;
            }
            //값이 없으면 생성 객체 입력
            TboardMsg.instance = this;
        }


        getMsg(_msgCode, _words) {
            let message = this.magIdMap(_msgCode);
			if (_words && Array.isArray(_words)) {
                _words.forEach((_word, i) => {
                    message = message.replaceAll(`{${i}}`, _word);
                });
			}
            return message;
        }

        magIdMap(_msgCode) {
            this.msgInfo = {
                "msg_000" : "게시판이 정상적으로 생성 되었습니다.",
                "msg_001" : "정상 처리 되었습니다.",
                "msg_100" : "게시글이 등록되었습니다.",
                "msg_101" : "게시글이 수정되었습니다.",
                "msg_102" : "게시글이 삭제되었습니다.",
                
                "msg_700" : "통합게시판 api요청 중 오류가 발생했습니다. 관리자에게 문의하시기 바랍니다.",
                "msg_701" : "통합게시판 api요청 파라메터 중 서비스아이디가 없습니다. 확인 후 다시 시도하시기 바랍니다.",
                "msg_702" : "상세정보 api요청 시 게시물번호는 필수값입니다. 확인 후 다시 시도하시기 바랍니다.",
                "msg_703" : "파일다운로드 시 {0}은(는) 필수값입니다. 확인 후 다시 시도하시기 바랍니다.",

                "msg_800" : "통합게시판 처리 중 오류가 발생했습니다. 관리자에게 문의하시기 바랍니다.",
                "msg_801" : "통합게시판 입력 값 오류가 발생했습니다. 관리자에게 문의하시기 바랍니다.",
                "msg_803" : "게시판 채널 정보가 없습니다. 확인 후 다시 시도하시기 바랍니다.",
                "msg_804" : "게시판 아이디 정보가 없습니다. 확인 후 다시 시도하시기 바랍니다.",
                "msg_805" : "게시판 서비스요청 정보가 없습니다. 확인 후 다시 시도하시기 바랍니다.",
                "msg_806" : "게시판 정보를 조회할 수 없습니다. 확인 후 다시 시도하시기 바랍니다.",
                "msg_807" : "등록 가능한 파일 수를 초과하였습니다.",
                "msg_808" : "허용되지 않은 파일이 있습니다.",
                "msg_809" : "파일크기를 확인하세요.",
                

                "msg_900" : "게시판이 생성 중 오류가 발생했습니다. 관리자에게 문의하시기 바랍니다.",
                "msg_901" : "게시판아이디가 없습니다. 확인 후 다시 시도하시기 바랍니다.",
                "msg_902" : "게시판 권한 확인 중 오류가 발생 했습니다. 확인 후 다시 시도하시기 바랍니다.",
                "msg_903" : "게시물 조회 중 오류가 발생했습니다. 확인 후 다시 시도하시기 바랍니다.",
                "msg_904" : "검색 조건을 선택 하시기 바랍니다.",
                "msg_905" : "검색 조건을 입력 하시기 바랍니다.",
                "msg_906" : "게시물 등록 중 오류가 발생했습니다. 확인 후 다시 시도하시기 바랍니다.",                
                "msg_907" : "{0}은(는) 필수 입력 입니다.",
                "msg_908" : "파일다운로드 중 오류가 발생했습니다. 확인 후 다시 시도하시기 바랍니다.",
                "msg_909" : "게시물 수정 중 오류가 발생했습니다. 확인 후 다시 시도하시기 바랍니다.",
                "msg_910" : "게시물 삭제 중 오류가 발생했습니다. 확인 후 다시 시도하시기 바랍니다.",
                "msg_911" : "삭제할 게시물이 없습니다. 확인 후 다시 시도하시기 바랍니다.",
                "msg_912" : "입력값에 문제가 있습니다. 확인 후 다시 시도하시기 바랍니다.",
                "msg_913" : "{0} 권한이 없습니다. 확인 후 다시 시도하시기 바랍니다.",
                "msg_914" : "사용 중지된 게시판입니다.",
                "msg_915" : "권한그룹 설정 정보를 찾을 수 없습니다. 관리자에게 문의하시기 바랍니다.",
                "msg_916" : "첨부파일이 존재하지 않습니다. 확인 후 다시 시도하시기 바랍니다.",
                "msg_917" : "유효한 {0}값이 아닙니다.",

                "msg_979" : "작성자가 아니면 게시글을 조회 할 수없습니다.",
                "msg_980" : "수정 할 게시물을 조회 할 수 없습니다. 확인 후 다시 시도하시기 바랍니다.",
                "msg_981" : "업로드 가능 한 파일크기를 초과 하였습니다. {0}",
                "msg_982" : "첨부파일이 삭제되었거나 찾을 수 없어 다운로드 할 수 없습니다.",
                "msg_983" : "첨부파일 다운로드 시간이 만료되었습니다.",
                "msg_984" : "댓글 내용의 입력 가능 길이가 초과 되었습니다.",
                "msg_985" : "게시글 제목의 입력 가능 길이가 초과 되었습니다.",
                "msg_986" : "작성자가 아니면 댓글을 삭제 할 수없습니다.",
                "msg_987" : "작성자가 아니면 댓글을 수정 할 수없습니다.",
                "msg_988" : "작성자가 아니면 게시글을 삭제 할 수없습니다.",
                "msg_989" : "작성자가 아니면 게시글을 수정 할 수없습니다.",
                "msg_990" : "통합게시판 요청 값이 잘못 되었습니다. 관리자에게 문의하시기 바랍니다.",
                "msg_991" : "게시판 접근 권한이 없어 사용할 수 없습니다.",
                "msg_992" : "첨부파일을 다운로드 할 수 없습니다.",
                "msg_993" : "비밀글을 확인 할 수 없습니다.",
                "msg_994" : "게시글을 확인 할 수 없습니다.",
                "msg_995" : "게시글을 조회할 수 없습니다. 확인 후 다시 시도하시기 바랍니다.",
                "msg_996" : "입력값이 잘못되었습니다.",
                "msg_997" : "세션 값이 없거나 변경 되었습니다.",
                "msg_998" : "권한이 없습니다.",
                "msg_999" : "에러가 발생 했습니다. 관리자에게 문의하시기 바랍니다."
            };

            return this.msgInfo[ _msgCode ] || "";
        }

    };


    //window["KOSHATboard"] = new KOSHATboard();
    (() => {                
        tboardUtil = new TboardUtil();
        tboardImgUtil = new TboardImgUtil();
        tboardMsg = new TboardMsg();
        tboardMng = new KOSHATboard();
        
        window.koshaTboard = tboardMng;
    })();

    
    typeof global != "undefined" && window.koshaTboard && (global.koshaTboard = window.koshaTboard);
}())




