/*
 * Copyright 2008-2009 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package kr.or.kosha.tboard.web;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.core.HttpHeaders;

import org.egovframe.rte.fdl.property.EgovPropertyService;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.ObjectMapper;

import kr.or.kosha.tboard.boot.web.DataUtil;
import kr.or.kosha.tboard.boot.web.StdTboardArtclUtil;
import kr.or.kosha.tboard.boot.web.StdTboardDataUtil;
import kr.or.kosha.tboard.boot.web.StdTboardOptionUtil;
import kr.or.kosha.tboard.boot.web.StdTboardSessionUtil;
import kr.or.kosha.tboard.boot.web.StdTempData;
import kr.or.kosha.tboard.boot.web.TboardResponse;
import kr.or.kosha.tboard.boot.web.TboardUtil;
import kr.or.kosha.tboard.service.CustomException;
import kr.or.kosha.tboard.service.TboardService;

/**
 * @Class Name : EgovSampleController.java
 * @Description : EgovSample Controller Class
 * @Modification Information
 * @
 * @  수정일      수정자              수정내용
 * @ ---------   ---------   -------------------------------
 * @ 2009.03.16           최초생성
 *
 * @author 개발프레임웍크 실행환경 개발팀
 * @since 2009. 03.16
 * @version 1.0
 * @see
 *
 *  Copyright (C) by MOPAS All right reserved.
 */

@CrossOrigin(origins = "http://127.0.0.1:4098")  // 특정 도메인에서만 허용
@Controller
@RequestMapping(value = "/tboard")
public class TboardController {

	/** EgovSampleService */
	@Resource(name = "tboardService")
	private TboardService tboardService;

	/** EgovPropertyService */
	@Resource(name = "propertiesService")
	protected EgovPropertyService propertiesService;
	
	
	

	
	/**
	 * 글 목록을 조회한다. (pageing)
	 * @param searchVO - 조회할 정보가 담긴 SampleDefaultVO
	 * @param model
	 * @return "egovSampleList"
	 * @exception Exception
	 */
	@SuppressWarnings("unchecked")
	@CrossOrigin
	@GetMapping(value = "/test3.do")
	public ResponseEntity<JSONObject> test3(ModelMap model, HttpServletRequest request) throws Exception {

        try {
        	
            ObjectMapper objectMapper = new ObjectMapper();
            StdTboardDataUtil stdUtil = new StdTboardDataUtil();
            
            System.out.println("------------------!!!!!!");
            
            this.getAuthData(null);
            
            JSONArray array = new JSONArray();
            JSONObject object = new JSONObject();
            object = new JSONObject();
            object.put("artclNo", "D00000001");
            object.put("artclData", "20180111|20180201");
            array.add(object);
            object = new JSONObject();
            object.put("artclNo", "D00000002");
            object.put("artclData", "201801|201802");
            array.add(object);
            object = new JSONObject();
            object.put("artclNo", "D00000003");
            object.put("artclData", "01|04");
            array.add(object);
            object = new JSONObject();
            object.put("artclNo", "D00000004");
            object.put("artclData", "001|003");
            array.add(object);
            object = new JSONObject();
            object.put("artclNo", "D00000005");
            object.put("artclData", "1180001|1180002");
            array.add(object);
            
            JSONObject inputData = new JSONObject();
            inputData.put("list", array);

            
            JSONArray inputArray = (JSONArray)inputData.get("list");
            inputArray.stream().forEach(obj -> {
            	System.out.println( obj );
            	
            	String artclData = ((JSONObject)obj).containsKey("artclData") ? ((JSONObject)obj).get("artclData").toString() : "";
            	String artclType = ((JSONObject)obj).containsKey("artclType") ? ((JSONObject)obj).get("artclType").toString() : "";

            	//01. 화면에서 넘어온 타입(기간, 체크) 체크
            	if (artclType.equals("period") ) {
            		JSONObject objInput = new JSONObject();
            		String[] strSplit = artclData.split("|");
            		objInput.put("strt_dt1", strSplit[0]);
            		objInput.put("end_dt1", strSplit[1]);
            	}
            	else if (artclType.equals("check") ) {
                	String[] strSplit = artclData.split("|");
            		JSONArray arrTemp = new JSONArray(); 
            		for (String str : strSplit) {
            			arrTemp.add(str);
            		}
            	}
            	
            	
            	System.out.println( "artclData : " + artclData );
            });
            
            
            
            System.out.println("inputData : " + inputData.toJSONString());
            
    		return new ResponseEntity<>(null, HttpStatus.OK);
        
        } catch (IllegalArgumentException e) {
    		TboardResponse response = new TboardResponse();
        	response.setRtnCode("-1");
        	response.setRtnSubCode("-1");
        	response.setRtnSubMsg(e.getMessage());
        } catch (NullPointerException e) {
        	
        	
        	
        } catch (Exception e) {
            e.printStackTrace();
        }

        return null;
	}
	
	
	public void getAuthData(Object obj) {
        for (int i = 0; i < 1000000; i++) {
            try {
                // NullPointerException을 반복적으로 발생시켜 예외가 자주 던져지도록 설정
                String str = null;
                str.length();  // 예외 발생
            } catch (Exception e) {
                // 반복적으로 예외가 발생하므로, 모든 예외에서 stack trace를 출력
                e.printStackTrace();
            }
        }
	}
	
	
	/**
	 * 글 목록을 조회한다. (pageing)
	 * @param searchVO - 조회할 정보가 담긴 SampleDefaultVO
	 * @param model
	 * @return "egovSampleList"
	 * @exception Exception
	 */
	@CrossOrigin
	@GetMapping(value = "/test2.do")
	public ResponseEntity<JSONObject> test2(ModelMap model, HttpServletRequest request) throws Exception {

        try {
        	
            ObjectMapper objectMapper = new ObjectMapper();
            StdTboardDataUtil stdUtil = new StdTboardDataUtil();
            
    		JSONObject rtnData = new JSONObject();
    		JSONArray jsonPostList = new JSONArray();
            for (int i = 1; i <= 100; i++) {
                JSONObject jsonPost = new JSONObject();
                jsonPost.put("pstId", "b" + String.format("%06d", i));
                jsonPost.put("pstNm", "제목" + i);
                jsonPost.put("pstCn", "내용" + i);
                jsonPost.put("wrtrNm", "홍길동" + i);
                jsonPost.put("wrtrId", "kydak733@naver.com" + i);
                jsonPost.put("rnum", (long)i);
                jsonPostList.add(jsonPost);
            }
            
    		JSONArray jsonArtclList = new JSONArray();
            for (int i = 1; i <= 100; i++) {
                for (int j = 1; j <= 5; j++) {
                	JSONObject jsonArtcl = new JSONObject();
                	jsonArtcl.put("pstId", "b" + String.format("%06d", i));
                	jsonArtcl.put("artclNo"   , "artclNo" + j);
                	jsonArtcl.put("artclValue", "artclValue" + j);
                	jsonArtclList.add(jsonArtcl);	
                }
            }
            
    		JSONArray jsonFileList = new JSONArray();
            for (int i = 1; i <= 100; i++) {
                for (int j = 1; j <= 3; j++) {
                	JSONObject jsonFile = new JSONObject();
                	jsonFile.put("pstId", "b" + String.format("%06d", i));
	                if ( i % 2 == 0) {
	                	jsonFile.put("artclNo", "atch" + j);
	                	jsonFile.put("artclValue", "Y");
                	}
                	else {
                		jsonFile.put("artclNo", "atch" + j);
                		jsonFile.put("artclValue", "N");
                	}
	                jsonFileList.add(jsonFile);	
                }
            }

            System.out.println("-----------------------------------------");
            System.out.println("-----------------------------------------");
            System.out.println("-----------------------------------------");
            System.out.println("-----------------------------------------");
            
            
            // pstId를 기준으로 jsonArtclList, jsonFileList를 매핑
            Map<String, ArrayList<JSONObject>> artclMap = new HashMap<>();

            // jsonArtclList에서 pstId별로 grouping
            this.convertJSONArrayToList(jsonArtclList).stream()
            .forEach(json -> {
                
				String pstId = json.get("pstId").toString();
                artclMap.computeIfAbsent(pstId, k -> new ArrayList<JSONObject>()).add(json);
            });
            
            this.convertJSONArrayToList(jsonFileList).stream()
            .forEach(json -> {
                String pstId = (String) json.get("pstId");
                artclMap.computeIfAbsent(pstId, k -> new ArrayList<JSONObject>()).add(json);
            });
            
            
            // jsonPostList에서 각 요소에 artclNo, file 데이터를 추가
            this.convertJSONArrayToList(jsonPostList).forEach(post -> {	  
                String pstId = (String) post.get("pstId");

                List<JSONObject> artclList = artclMap.get(pstId);
                if (artclList == null) {
                	return;
                }
                
                artclList.stream().forEach(artcl -> {
                	post.put(artcl.get("artclNo"), artcl.get("artclValue"));
                });
            });
            
            //faq 내용
            //gallery 썸네일 첨부파일번호
            System.out.println(jsonPostList);
            System.out.println("-----------------------------------------");
            System.out.println("-----------------------------------------");
            System.out.println("-----------------------------------------");
            System.out.println("-----------------------------------------");

            
            
            JSONObject temp = new JSONObject();
            
    		temp.put("data", jsonPostList);
    		return new ResponseEntity<>(temp, HttpStatus.OK);
        
        } catch (IllegalArgumentException e) {
    		TboardResponse response = new TboardResponse();
        	response.setRtnCode("-1");
        	response.setRtnSubCode("-1");
        	response.setRtnSubMsg(e.getMessage());
    		
        } catch (Exception e) {
            e.printStackTrace();
        }
        

        return null;
        
        
	
	}
	
	
	
	
	
	
	/**
	 * 글 목록을 조회한다. (pageing)
	 * @param searchVO - 조회할 정보가 담긴 SampleDefaultVO
	 * @param model
	 * @return "egovSampleList"
	 * @exception Exception
	 */
	@GetMapping(value = "/test.do")
	public ResponseEntity<TboardResponse> test(ModelMap model, HttpServletRequest request) throws Exception {
        
		try {
	        String jsonString = "{\r\n"
	        		+ "        \"common\": {\r\n"
	        		+ "            \"frontInfo\": {}\r\n"
	        		+ "            , \"paging\": {}\r\n"
	        		+ "            , \"authInfo\": {}\r\n"
	        		+ "            , \"secrity\": \"\"\r\n"
	        		+ "            , \"tboard\": {\r\n"
	        		+ "                \"bbsId\": \"\"\r\n"
	        		+ "                , \"channel\": \"\"\r\n"
	        		+ "                , \"systemCd\": \"\"\r\n"
	        		+ "            }\r\n"
	        		+ "            , \"data\": {}\r\n"
	        		+ "        },\r\n"
	        		+ "        \"service\": {\r\n"
	        		+ "            \"info\": {\"id\": \"\", \"type\": \"\"}\r\n"
	        		+ "            ,\"data\": {\"test\":\"testt\"}\r\n"
	        		+ "        }\r\n"
	        		+ "    }";

	        try {
	        	
	            ObjectMapper objectMapper = new ObjectMapper();
	            StdTboardDataUtil dataUtil = objectMapper.readValue(jsonString, StdTboardDataUtil.class);
	            System.out.println("DataUtil: " + dataUtil.getCommon().getFrontInfo());
	            
	            System.out.println("DataUtil: " + dataUtil.getService().getData());
	            
	            
	            StdTboardDataUtil stdUtil = new StdTboardDataUtil();
	            
	            System.out.println("===============================");
	            System.out.println( stdUtil.getCommon() );
	            System.out.println("===============================");
	            
	            stdUtil.getCommon().getTboard().setBbsId("b230130321");
	            stdUtil.getCommon().getTboard().setChannel("web");
	            stdUtil.getCommon().getTboard().setSystemCd("10");
	            
	    		System.out.println("===============================");
	            System.out.println( stdUtil.getCommon().getTboard() );
	    		System.out.println("===============================");

	            System.out.println("-----------------------------------------");
	            System.out.println("-----------------------------------------");
	            System.out.println("-----------------------------------------");
	            System.out.println("-----------------------------------------");
	    		
	    		JSONObject rtnData = new JSONObject();
	    		JSONArray jsonPostList = new JSONArray();
	            for (int i = 1; i <= 100; i++) {
	                JSONObject jsonPost = new JSONObject();
	                jsonPost.put("pstId", "b" + String.format("%06d", i));
	                jsonPost.put("pstNm", "제목" + i);
	                jsonPost.put("pstCn", "내용" + i);
	                jsonPost.put("wrtrNm", "홍길동" + i);
	                jsonPost.put("wrtrId", "kydak733@naver.com" + i);
	                jsonPost.put("rnum", (long)i);
	                jsonPostList.add(jsonPost);
	            }
	            
	    		JSONArray jsonArtclList = new JSONArray();
	            for (int i = 1; i <= 100; i++) {
	                for (int j = 1; j <= 5; j++) {
	                	JSONObject jsonArtcl = new JSONObject();
	                	jsonArtcl.put("pstId", "b" + String.format("%06d", i));
	                	jsonArtcl.put("artclNo"   , "artclNo" + j);
	                	jsonArtcl.put("artclValue", "artclValue" + j);
	                	jsonArtclList.add(jsonArtcl);	
	                }
	            }
	            
	    		JSONArray jsonFileList = new JSONArray();
	            for (int i = 1; i <= 100; i++) {
	                for (int j = 1; j <= 3; j++) {
	                	JSONObject jsonFile = new JSONObject();
	                	jsonFile.put("pstId", "b" + String.format("%06d", i));
		                if ( i % 2 == 0) {
		                	jsonFile.put("artclNo", "atch" + j);
		                	jsonFile.put("artclValue", "Y");
	                	}
	                	else {
	                		jsonFile.put("artclNo", "atch" + j);
	                		jsonFile.put("artclValue", "N");
	                	}
		                jsonFileList.add(jsonFile);	
	                }
	            }

	            System.out.println("-----------------------------------------");
	            System.out.println("-----------------------------------------");
	            System.out.println("-----------------------------------------");
	            System.out.println("-----------------------------------------");
	            
	            
	            // pstId를 기준으로 jsonArtclList, jsonFileList를 매핑
	            Map<String, ArrayList<JSONObject>> artclMap = new HashMap<>();

	            // jsonArtclList에서 pstId별로 grouping
	            this.convertJSONArrayToList(jsonArtclList).stream()
	            .forEach(json -> {
	                
					String pstId = json.get("pstId").toString();
	                artclMap.computeIfAbsent(pstId, k -> new ArrayList<JSONObject>()).add(json);
	            });
	            
	            this.convertJSONArrayToList(jsonFileList).stream()
	            .forEach(json -> {
	                String pstId = (String) json.get("pstId");
	                artclMap.computeIfAbsent(pstId, k -> new ArrayList<JSONObject>()).add(json);
	            });
	            
	            
	            // jsonPostList에서 각 요소에 artclNo, file 데이터를 추가
	            this.convertJSONArrayToList(jsonPostList).forEach(post -> {	  
	                String pstId = (String) post.get("pstId");

	                List<JSONObject> artclList = artclMap.get(pstId);
	                if (artclList == null) {
	                	return;
	                }
	                
	                artclList.stream().forEach(artcl -> {
	                	post.put(artcl.get("artclNo"), artcl.get("artclValue"));
	                });
	            });
	            
	            //faq 내용
	            //gallery 썸네일 첨부파일번호
	            System.out.println(jsonPostList);
	            
	            
	            System.out.println("-----------------------------------------");
	            System.out.println("-----------------------------------------");
	            System.out.println("-----------------------------------------");
	            System.out.println("-----------------------------------------");

	            
	            String jsonArtcl = "[{\r\n"
	            		+ "    \"type1\": \"search\",\r\n"
	            		+ "    \"type2\": \"control\",\r\n"
	            		+ "    \"value\": \"{\\\"S01\\\": {\\\"cpt\\\":\\\"\\\", \\\"req\\\": \\\"\\\"}}\"\r\n"
	            		+ "}\r\n"
	            		+ ",{\r\n"
	            		+ "    \"type1\": \"search\",\r\n"
	            		+ "    \"type2\": \"control\",\r\n"
	            		+ "    \"value\": \"{\\\"S02\\\": {\\\"cpt\\\":\\\"\\\", \\\"req\\\": \\\"\\\"}}\"\r\n"
	            		+ "}\r\n"
	            		+ ",{\r\n"
	            		+ "    \"type1\": \"search\",\r\n"
	            		+ "    \"type2\": \"control\",\r\n"
	            		+ "    \"value\": \"{\\\"S03\\\": {\\\"len\\\":\\\"50\\\", \\\"req\\\": \\\"Y\\\", \\\"file\\\": {\\\"size\\\":  5, \\\"ext\\\": \\\"jpg|bmp|png\\\", \\\"cnt\\\":10} }}\"\r\n"
	            		+ "}\r\n"
	            		+ ",{\r\n"
	            		+ "    \"type1\": \"search\",\r\n"
	            		+ "    \"type2\": \"sort\",\r\n"
	            		+ "    \"value\": \"{\\\"1\\\": \\\"S01\\\", \\\"2\\\": \\\"S02\\\", \\\"3\\\": \\\"S03\\\"}\"\r\n"
	            		+ "}\r\n"
	            		+ ",{\r\n"
	            		+ "    \"type1\": \"list\",\r\n"
	            		+ "    \"type2\": \"control\",\r\n"
	            		+ "    \"value\": \"{\\\"L01\\\": {\\\"cpt\\\":\\\"\\\", \\\"req\\\": \\\"\\\"}}\"\r\n"
	            		+ "}\r\n"
	            		+ ",{\r\n"
	            		+ "    \"type1\": \"list\",\r\n"
	            		+ "    \"type2\": \"control\",\r\n"
	            		+ "    \"value\": \"{\\\"L02\\\": {\\\"cpt\\\":\\\"\\\", \\\"req\\\": \\\"\\\"}}\"\r\n"
	            		+ "}\r\n"
	            		+ ",{\r\n"
	            		+ "    \"type1\": \"list\",\r\n"
	            		+ "    \"type2\": \"control\",\r\n"
	            		+ "    \"value\": \"{\\\"L03\\\": {\\\"cpt\\\":\\\"\\\", \\\"req\\\": \\\"\\\", \\\"file\\\": {\\\"size\\\":  5, \\\"ext\\\": \\\"jpg|bmp|png\\\", \\\"cnt\\\":10} }}\"\r\n"
	            		+ "}\r\n"
	            		+ ",{\r\n"
	            		+ "    \"type1\": \"list\",\r\n"
	            		+ "    \"type2\": \"sort\",\r\n"
	            		+ "    \"value\": \"{\\\"1\\\": \\\"L01\\\", \\\"2\\\": \\\"L02\\\", \\\"3\\\": \\\"L03\\\"}\"\r\n"
	            		+ "}\r\n"
	            		+ ",{\r\n"
	            		+ "    \"type1\": \"detail\",\r\n"
	            		+ "    \"type2\": \"control\",\r\n"
	            		+ "    \"value\": \"{\\\"D01\\\": {\\\"cpt\\\":\\\"\\\", \\\"req\\\": \\\"\\\"}}\"\r\n"
	            		+ "}\r\n"
	            		+ ",{\r\n"
	            		+ "    \"type1\": \"detail\",\r\n"
	            		+ "    \"type2\": \"control\",\r\n"
	            		+ "    \"value\": \"{\\\"D02\\\": {\\\"cpt\\\":\\\"\\\", \\\"req\\\": \\\"\\\"}}\"\r\n"
	            		+ "}\r\n"
	            		+ ",{\r\n"
	            		+ "    \"type1\": \"detail\",\r\n"
	            		+ "    \"type2\": \"control\",\r\n"
	            		+ "    \"value\": \"{\\\"D03\\\": {\\\"cpt\\\":\\\"\\\", \\\"req\\\": \\\"\\\", \\\"file\\\": {\\\"size\\\":  5, \\\"ext\\\": \\\"jpg|bmp|png\\\", \\\"cnt\\\":10} }}\"\r\n"
	            		+ "}\r\n"
	            		+ ",{\r\n"
	            		+ "    \"type1\": \"detail\",\r\n"
	            		+ "    \"type2\": \"sort\",\r\n"
	            		+ "    \"value\": \"{\\\"1\\\": \\\"D01\\\", \\\"2\\\": \\\"D02\\\", \\\"3\\\": \\\"D03\\\"}\"\r\n"
	            		+ "}\r\n"
	            		+ ",{\r\n"
	            		+ "    \"type1\": \"write\",\r\n"
	            		+ "    \"type2\": \"control\",\r\n"
	            		+ "    \"value\": \"{\\\"W01\\\": {\\\"cpt\\\":\\\"\\\", \\\"req\\\": \\\"\\\"}}\"\r\n"
	            		+ "}\r\n"
	            		+ ",{\r\n"
	            		+ "    \"type1\": \"write\",\r\n"
	            		+ "    \"type2\": \"control\",\r\n"
	            		+ "    \"value\": \"{\\\"W02\\\": {\\\"cpt\\\":\\\"\\\", \\\"req\\\": \\\"\\\"}}\"\r\n"
	            		+ "}\r\n"
	            		+ ",{\r\n"
	            		+ "    \"type1\": \"write\",\r\n"
	            		+ "    \"type2\": \"control\",\r\n"
	            		+ "    \"value\": \"{\\\"W03\\\": {\\\"cpt\\\":\\\"\\\", \\\"req\\\": \\\"\\\", \\\"file\\\": {\\\"ext\\\": \\\"jpg|bmp|png\\\",\\\"size\\\": 5,\\\"cnt\\\": 10,\\\"dd\\\": {\\\"xxx\\\": \\\"test\\\"}} }}\"\r\n"
	            		+ ""
	            		+ "}\r\n"
	            		+ ",{\r\n"
	            		+ "    \"type1\": \"write\",\r\n"
	            		+ "    \"type2\": \"sort\",\r\n"
	            		+ "    \"value\": \"{\\\"1\\\": \\\"W01\\\", \\\"2\\\": \\\"W02\\\", \\\"3\\\": \\\"W03\\\"}\"\r\n"
	            		+ "}\r\n"
	            		+ ",{\r\n"
	            		+ "    \"type1\": \"reply\",\r\n"
	            		+ "    \"type2\": \"control\",\r\n"
	            		+ "    \"value\": \"{\\\"R01\\\": {\\\"cpt\\\":\\\"\\\", \\\"req\\\": \\\"\\\"}}\"\r\n"
	            		+ "}\r\n"
	            		+ ",{\r\n"
	            		+ "    \"type1\": \"reply\",\r\n"
	            		+ "    \"type2\": \"control\",\r\n"
	            		+ "    \"value\": \"{\\\"R02\\\": {\\\"cpt\\\":\\\"\\\", \\\"req\\\": \\\"\\\"}}\"\r\n"
	            		+ "}\r\n"
	            		+ ",{\r\n"
	            		+ "    \"type1\": \"reply\",\r\n"
	            		+ "    \"type2\": \"control\",\r\n"
	            		+ "    \"value\": \"{\\\"R03\\\": {\\\"cpt\\\":\\\"\\\", \\\"req\\\": \\\"\\\", \\\"file\\\": {\\\"size\\\":  5, \\\"ext\\\": \\\"jpg|bmp|png\\\", \\\"cnt\\\":10} }}\"\r\n"
	            		+ "}\r\n"
	            		+ ",{\r\n"
	            		+ "    \"type1\": \"reply\",\r\n"
	            		+ "    \"type2\": \"sort\",\r\n"
	            		+ "    \"value\": \"{\\\"1\\\": \\\"R01\\\", \\\"2\\\": \\\"R02\\\", \\\"3\\\": \\\"R03\\\"}\"\r\n"
	            		+ "}\r\n"
	            		+ "]";
	            
	            //1. 항목데이터
	            JSONArray jsonArrArtcl = objectMapper.readValue(jsonArtcl, JSONArray.class);
	            JSONParser parser = new JSONParser();
	            JSONArray jsonArray = (JSONArray) parser.parse(jsonArtcl);
	            
	            //2. value값이 스트링으로 되어 있으면 => JSON OBJECT로 parsing
	            for (Object obj : jsonArray) {
	                JSONObject jsonObject = (JSONObject) obj;
	                String value = (String) jsonObject.get("value");
	                JSONObject valueObject = (JSONObject) parser.parse(value);
	                jsonObject.put("value", valueObject);
	            }
	            
	            
//	            // 그룹핑 결과 저장용 Map
//	            Map<String, Map<String, Object>> result = new HashMap<>();
//
//	            
//	            
//	            //3. 필요한 형태로 데이터 변경
//	            this.convertJSONArrayToList(jsonArray).stream().forEach(artclInfo -> {
//	            	String type1Key = (String) artclInfo.get("type1"); // search, list, etc.
//	            	String type2Key = (String) artclInfo.get("type2"); // control, sort
//
//	            	JSONObject value = (JSONObject) artclInfo.get("value");
//	            	
//	                // type1이 존재하지 않으면 초기화
//	            	result.putIfAbsent(type1Key, new HashMap<>());
//	                Map<String, Object> type1Map = result.get(type1Key);
//
//	                // type2가 존재하지 않으면 초기화
//	                type1Map.putIfAbsent(type2Key, new JSONObject());
//	                Map<String, Object> type2Map = (Map<String, Object>) type1Map.get(type2Key);
//	                
//	                // value 값을 type2Map에 병합
//	                Iterator<String> keys = value.keySet().iterator();
//	                while (keys.hasNext()) {
//	                    String field = keys.next();
//	                    type2Map.put(field, value.get(field));
//	                    
//	                    System.out.println(field +  " : " + type2Map.get(field).getClass());
//	                    if ("W03".equals(field) ) {
//	                    	System.out.println("xxx");
//	                    }
//	                    
//	                    if(type2Map.get(field) instanceof JSONObject) {
//	                    	if (((JSONObject)type2Map.get(field)).containsKey("file")) {
//	                    		System.out.println(((JSONObject)type2Map.get(field)).get("file").getClass());
//	                    	}
//	                    }
//	                }
//	            });
	            
	            

	            //방법1
	            //jsonArray DB 조회값
	            JSONObject resultJson = StdTboardArtclUtil.reformatArclJson(jsonArray);
	            //resultJson 변환 값 (search{control.sort}.... 형태)
	            objectMapper = new ObjectMapper();
	            StdTboardArtclUtil optionManager2 = objectMapper.readValue(resultJson.toString(), StdTboardArtclUtil.class);
	            
	            //방법2. 
	            StdTboardArtclUtil optionManager = new StdTboardArtclUtil(jsonArray);
	            
	            
	            //
	            /*
	            System.out.println("-------------------------");
	            System.out.println(optionManager2.toJSONString());
	            System.out.println(optionManager.toJSONString());
	            
	            System.out.println("-------------------------");
	            System.out.println( optionManager.getWrite().getControl() );
	            
	            System.out.println("-------------------------");
	            
	            JSONObject fileInfo = (JSONObject) optionManager.getWrite().getCtrlInfo("W03");
	            System.out.println( fileInfo.get("file") );
	            
	            System.out.println( ((JSONObject)fileInfo.get("file")).get("ext").toString() );
	            
	            System.out.println("-------------------------");
	            
	            System.out.println( optionManager.getWriteReply() );
	            System.out.println( optionManager.getWriteReply().getControl() );
	            
	            System.out.println( optionManager.getSearch().isControl() );
	            System.out.println( optionManager.getList().isControl() );
	            System.out.println( optionManager.getDetail().isControl() );
	            System.out.println( optionManager.getReply().isControl() );
	            System.out.println( optionManager.getWrite().isControl() );
	            System.out.println( optionManager.getWriteReply().isControl() );
	            
	            System.out.println( optionManager.getSearch().isSort() );
	            System.out.println( optionManager.getList().isSort() );
	            System.out.println( optionManager.getDetail().isSort() );
	            System.out.println( optionManager.getReply().isSort() );
	            System.out.println( optionManager.getWrite().isSort() );
	            System.out.println( optionManager.getWriteReply().isSort() );
	            
	            System.out.println("-------------------------");
	            
	            System.out.println( optionManager.getWrite().checkUploadCnt("W03", 5) );
	            System.out.println( optionManager.getWrite().checkUploadSize("W03", 10000) );
	            System.out.println( optionManager.getWrite().checkAllowedExt("W03", "jpg") );
	            System.out.println("-------------------------");	            
	            
	            System.out.println( optionManager.getSearch().isReqired("S03") );
	            System.out.println( optionManager.getWrite().isReqired("W03") );
	            System.out.println( optionManager.getSearch().getLength("S03"));
	            System.out.println( optionManager.getSearch().getLength("S02"));
	            */
	            
	            //포털 시스템은 request에서 코드값으로 관리됨
	            //bbsid_web_  포털-
	            //bbsid_web_  포털교육-
	            //bbsid_mobile_ 포털교육-
	            //레디스에 별개의 값으로 등록
	            
	            //erp 시스템에서 같은 게시판을 다른채널로 연다면?
	            //bbsid_admin_권한, bbsid_web_권한 각자 등록됨
	            
	            // JSON 문자열 길이 구하기
	            int byteSize = optionManager2.toJSONString().getBytes().length;
	            System.out.println("JSON 데이터 크기: " + byteSize + " 바이트");
	            
	
	            
	            // JSON 파싱
	            //방법 1: permArray DB조회값
	            JSONArray permArray = (JSONArray) StdTempData.getData().get("prmsInfo");
	            StdTboardOptionUtil optUtil = new StdTboardOptionUtil(permArray);
	            
	            //방법 2: basic.access, basic.read 변환 값
	            StdTboardOptionUtil optUtil2 = new StdTboardOptionUtil( StdTboardOptionUtil.reformat(permArray) );
	            System.out.println("--------------------------------------------");
	            
	            
	            System.out.println( optUtil.isBasicAdmin()  );
	            System.out.println( optUtil.isReplyAdmin()  );
	            System.out.println( optUtil.isCommentAdmin()  );
	            System.out.println( optUtil.isCommentReplyAdmin() );
	            System.out.println( optUtil.isFileAdmin() );
	            
	            System.out.println( optUtil.hasPermission("basic.access") );
	            System.out.println( optUtil.hasPermission("basic.read") );
	            System.out.println( optUtil.hasPermission("basic.write") );
	            System.out.println( optUtil.hasPermission("basic.delete") );
	            
	            System.out.println( optUtil.hasPermission("reply.access") );
	            System.out.println( optUtil.hasPermission("reply.read") );
	            System.out.println( optUtil.hasPermission("reply.write") );
	            System.out.println( optUtil.hasPermission("reply.delete") );
	            
	            System.out.println( optUtil.hasPermission("file.download") );
	            System.out.println( optUtil.hasPermission("file.upload") );
	            
	            
//	            if (optUtil.hasPermission("basic.access") == false) {
//	            	TboardResponse response = new TboardResponse();
//	            	response.setRtnCode("-1");
//	            	response.setRtnSubCode("403");
//	            	response.setRtnSubCode("조회 권한이 없습니다.");
//	            	return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
//	            }
	            
	            System.out.println("--------------------------------------------");
	            //1. 세션 유틸 생성
	            JSONObject bbsInfo = new JSONObject();
	            bbsInfo.put("sysSeCd"  , "10");
	            bbsInfo.put("channelCd", "admin");
	            bbsInfo.put("bbsId"    , "B202412220000001");
	            
	            StdTboardSessionUtil sessionUtil = new StdTboardSessionUtil(request, bbsInfo);
	            
	            sessionUtil.init(request, bbsInfo);
	            
	            System.out.println( sessionUtil.getBbsInfo().getBbsId() );
	            System.out.println( sessionUtil.getBbsInfo().getChannelCd() );
	            System.out.println( sessionUtil.getBbsInfo().getSysSeCd() );
	            

	            if (sessionUtil.getOptionUtil().hasPermission("basic.read")) {
	            	System.out.println("-----------------------------baisc.read true");
	            }
	            else {
	            	System.out.println("-----------------------------baisc.read false");
	            }
	            
	            
	            

	        
	        
	        } catch (IllegalArgumentException e) {
        		TboardResponse response = new TboardResponse();
            	response.setRtnCode("-1");
            	response.setRtnSubCode("-1");
            	response.setRtnSubMsg(e.getMessage());
            	return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
        		
	        } catch (Exception e) {
	            e.printStackTrace();
	        }
			
		} catch (CustomException e) {
			e.printStackTrace();
		} catch (Exception e) {
			e.printStackTrace();
		}

		TboardResponse response = new TboardResponse();
		
		System.out.println("===============================end2");
		return new ResponseEntity<>(response, HttpStatus.OK);
	}
	
	
	
	private List<JSONObject> convertJSONArrayToList(JSONArray jsonArray) {
		List<JSONObject> jsonList = new ArrayList<>();
		for (Object obj : jsonArray) {
			jsonList.add((JSONObject)obj);
		}
		return jsonList;
	}
	
	
	
	
	/**
	 * 글 목록을 조회한다. (pageing)
	 * @param searchVO - 조회할 정보가 담긴 SampleDefaultVO
	 * @param model
	 * @return "egovSampleList"
	 * @exception Exception
	 */
	@PostMapping(value = "/processTboard.do")
	public ResponseEntity<TboardResponse> selectSampleList(ModelMap model, HttpServletRequest requset) throws Exception {
		
		TboardUtil tboardUtil = new TboardUtil();
		TboardResponse response = new TboardResponse();
		
		try {
			
			System.out.println("===============================start");
			DataUtil dataUtil = tboardService.process(tboardUtil);
			System.out.println( dataUtil.getCode() );
			System.out.println("===============================end");
			
			
			response.setRtnData(dataUtil.getData());
			
		} catch (CustomException e) {
			response.setRtnCode(e.getErrorCode());
			response.setRtnMsg(e.getErrorMessage());
			response.setRtnSubCode(e.getErrorSubCode());
			response.setRtnSubMsg(e.getErrorSubMessage());
		} catch (Exception e) {
			response.setRtnCode("500");
			response.setRtnMsg("Internal Server Error");
			response.setRtnSubCode("-1");
			response.setRtnSubMsg("비정상오류 발생");
		}

		System.out.println( response.getRtnCode() );
		System.out.println( response.getRtnMsg() );
		System.out.println( response.getRtnSubCode() );
		System.out.println( response.getRtnSubMsg() );
		
		
		System.out.println("===============================end2");
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PostMapping(value = "/processMultiTboard2.do")
	public ResponseEntity<TboardResponse> selectSampleList1(ModelMap model, HttpServletRequest requset) throws Exception {
		
		TboardUtil tboardUtil = new TboardUtil();
		TboardResponse response = new TboardResponse();
		
		try {
			
			System.out.println("===============================start");
			DataUtil dataUtil = tboardService.process(tboardUtil);
			System.out.println( dataUtil.getCode() );
			System.out.println("===============================end");
			
			
			response.setRtnData(dataUtil.getData());
			
		} catch (CustomException e) {
			response.setRtnCode(e.getErrorCode());
			response.setRtnMsg(e.getErrorMessage());
			response.setRtnSubCode(e.getErrorSubCode());
			response.setRtnSubMsg(e.getErrorSubMessage());
		} catch (Exception e) {
			response.setRtnCode("500");
			response.setRtnMsg("Internal Server Error");
			response.setRtnSubCode("-1");
			response.setRtnSubMsg("비정상오류 발생");
		}

		System.out.println( response.getRtnCode() );
		System.out.println( response.getRtnMsg() );
		System.out.println( response.getRtnSubCode() );
		System.out.println( response.getRtnSubMsg() );
		
		
		System.out.println("===============================end2");
		return new ResponseEntity<>(response, HttpStatus.OK);
	}
	
	@PostMapping(value = "/processMultiTboard.do")
	public ResponseEntity<TboardResponse> uploadFiles(
			@RequestParam(value = "C09", required = false) List<MultipartFile> files,  // 파일 받기
	        @RequestParam("_JSON") String jsonData           ) throws Exception {
		
		TboardResponse response = new TboardResponse();
		
		try {
			
			System.out.println("===============================start");
			System.out.println("processMultiTboard");
			System.out.println("processMultiTboard");
			System.out.println("processMultiTboard");
			System.out.println("processMultiTboard");
			System.out.println("processMultiTboard");
			
			System.out.println("Received JSON Data: " + jsonData);
	        for (MultipartFile file : files) {
	            System.out.println("Uploaded file: " + file.getOriginalFilename());
	            // 파일 저장 로직 추가
	        }
	        
	        System.out.println("processMultiTboard");
			System.out.println("processMultiTboard");
			System.out.println("processMultiTboard");
			System.out.println("processMultiTboard");
			System.out.println("processMultiTboard");
			
			System.out.println("===============================end");
			
			
		} catch (CustomException e) {
			response.setRtnCode(e.getErrorCode());
			response.setRtnMsg(e.getErrorMessage());
			response.setRtnSubCode(e.getErrorSubCode());
			response.setRtnSubMsg(e.getErrorSubMessage());
		} catch (Exception e) {
			response.setRtnCode("500");
			response.setRtnMsg("Internal Server Error");
			response.setRtnSubCode("-1");
			response.setRtnSubMsg("비정상오류 발생");
		}

		System.out.println( response.getRtnCode() );
		System.out.println( response.getRtnMsg() );
		System.out.println( response.getRtnSubCode() );
		System.out.println( response.getRtnSubMsg() );
		
		
		System.out.println("===============================end2");
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	
	

	@GetMapping(value = "/fileDownload.do")
	public ResponseEntity<byte[]> uploadFiles(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		TboardResponse tresponse = new TboardResponse();

        // 메모리에서 ZIP 파일을 만들기 위한 ByteArrayOutputStream 사용
        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        
        
		try {
		    
			String rootPath = "/svc/stdtboard";
			String bbsId = "/20241202AAA";
			
			// 파일 생성
	        String[] filesToZip = {
	            "/aaa.pptx",
	            "/bbb.pptx"
	        };

	        
	        try (ZipOutputStream zipOut = new ZipOutputStream(byteArrayOutputStream)) {
	            for (String filePath : filesToZip) {
	                File file = new File(rootPath + bbsId + filePath);
	                if (file.exists() && file.isFile()) {
	                    try (FileInputStream fileIn = new FileInputStream(file)) {
	                        // 파일을 ZIP에 추가
	                        zipOut.putNextEntry(new ZipEntry(file.getName()));

	                        byte[] buffer = new byte[1024];
	                        int length;
	                        while ((length = fileIn.read(buffer)) > 0) {
	                            zipOut.write(buffer, 0, length);
	                        }

	                        zipOut.closeEntry();
	                    }
	                } else {
	                    System.out.println("파일이 존재하지 않거나 디렉토리입니다: " + filePath);
	                }
	            }
	        }


			
			
		} catch (CustomException e) {
			tresponse.setRtnCode(e.getErrorCode());
			tresponse.setRtnMsg(e.getErrorMessage());
			tresponse.setRtnSubCode(e.getErrorSubCode());
			tresponse.setRtnSubMsg(e.getErrorSubMessage());
		} catch (Exception e) {
			tresponse.setRtnMsg("Internal Server Error");
			tresponse.setRtnSubCode("-1");
			tresponse.setRtnSubMsg("비정상오류 발생");
		}
		
        // ZIP 파일을 메모리에서 읽어들인 후, 클라이언트에게 바로 전송
        byte[] zipBytes = byteArrayOutputStream.toByteArray();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=files.zip")
                .header(HttpHeaders.CONTENT_TYPE, "application/zip")
                .body(zipBytes);
		

	}
	

   public static String maskName(String name) {

        // 기본 형식에 맞지 않는 이름의 경우, 파라미터 값을 그대로 반환합니다.
        if (name == null || name.length() < 2) {
            return name;
        }

        int length = name.length();
        StringBuilder maskedName = new StringBuilder(name);

        // [CASE1] 이름이 2자리 인 경우 => 첫 번째 문자에 대해 마스킹
        if (length == 2) {
            maskedName.setCharAt(0, '*');
        }
        // [CASE2] 이름이 3자리 인 경우 => 두 번째 문자에 대해 마스킹
        else if (length == 3) {
            maskedName.setCharAt(1, '*');
        }
        // [CASE3] 이름이 4자리 인 경우 => 두 번째, 세 번째 문자에 대해 마스킹
        else if (length == 4) {
            maskedName.setCharAt(1, '*');
            maskedName.setCharAt(2, '*');
        }
        // [CASE4] 이름이 5자리 이상인 경우 => 첫 번째와 마지막 문자를 제외한 모든 문자에 대해 마스킹
        else if (length == 5) {
            maskedName.setCharAt(1, '*');
            maskedName.setCharAt(2, '*');
            maskedName.setCharAt(3, '*');
        }
        // [CASE5] 이름이 5자리 이상인 경우 => 첫 번째와 마지막 문자를 제외한 모든 문자에 대해 마스킹
        else {
            for (int i = 1; i < length - 1; i++) {
                maskedName.setCharAt(i, '*');
            }
        }

        return maskedName.toString();
    }
   

   /**
    * 휴대폰 번호에 대한 마스킹을 수행합니다.
    *
    * @param phoneNumber {String}  마스킹 이전 휴대폰 번호
    * @return {String} 마스킹 된 휴대폰 번호
    */
   public static String maskPhoneNumber(String phoneNumber) {

       // 기본 형식에 맞지 않는 핸드폰 번호의 경우, 파라미터 값을 그대로 반환합니다.
       if (phoneNumber == null || phoneNumber.length() < 10) {
           return phoneNumber;
       }

       StringBuilder maskedPhoneNumber = new StringBuilder(phoneNumber);
       int length = phoneNumber.length();

       // [CASE1] 핸드폰 번호의 하이픈이 포함된 경우
       if (phoneNumber.contains("-")) {
           String[] parts = phoneNumber.split("-");
           if (parts.length == 3) {

               // [CASE2-1] 가운데 번호가 3자리인 경우
               if (parts[1].length() == 3) {
                   maskedPhoneNumber.replace(4, 7, "***");     // 가운데 3자리를 마스킹
               }
               // [CASE2-2] 가운데 번호가 4자리인 경우
               else if (parts[1].length() == 4) {
                   maskedPhoneNumber.replace(4, 8, "****");    // 가운데 4자리를 마스킹
               }
           }

       }
       // [CASE2] 핸드폰 번호의 하이픈이 포함되지 않은 경우
       else {
           // [CASE2-1] 가운데 번호가 3자리인 경우
           if (length == 10) {
               maskedPhoneNumber.replace(3, 6, "***");     // 가운데 3자리를 마스킹
           }
           // [CASE2-2] 가운데 번호가 4자리인 경우
           else if (length == 11) {
               maskedPhoneNumber.replace(3, 7, "****");    // 가운데 4자리를 마스킹
           }
       }
       return maskedPhoneNumber.toString();
   }
   
   
   /**
    * 이메일 주소에 대한 마스킹을 수행합니다.
    *
    * @param email {String} : 마스킹 이전 이메일 주소
    * @return {String} 마스킹 된 이메일 주소
    */
   public static String maskEmail(String email) {

       // 기본 형식에 맞지 않는 이메일 주소의 경우, 파라미터 값을 그대로 반환합니다.
       if (email == null || !email.contains("@")) {
           return email;
       }

       String[] parts = email.split("@");
       String idPart = parts[0];           // 아이디
       String domainPart = parts[1];       // 이메일 도메인

       // 기본 형식에 맞지 않는 이메일 주소의 경우, 파라미터 값을 그대로 반환합니다.
       if (idPart.length() <= 3) {
           return email;
       }

       StringBuilder maskedEmail = new StringBuilder();
       maskedEmail.append(idPart.substring(0, 3));
       for (int i = 3; i < idPart.length(); i++) {
           maskedEmail.append('*');
       }
       maskedEmail.append('@').append(domainPart);

       return maskedEmail.toString();
   }
   
   // 게시글 수정 함수
   public boolean canEdit(JSONObject jsonPstInfo, String userId) {
	   boolean isAdmin = false;
       // 관리자는 모든 게시글을 수정할 수 있다.
       if (isAdmin) {
           return true;
       }

       // 사용자가 자신이 작성한 게시글만 수정할 수 있다.
       return "".equals(userId);
   }
   
   
   private static final String IMAGE_PATH = "/svc/stdtboard/20241202AAA/aaaa.png";  // 실제 이미지 경로로 수정
   @GetMapping("/api/get-image")
   public ResponseEntity<InputStreamResource> getImage() throws IOException {
       // 이미지 파일을 InputStream으로 읽기
       FileInputStream fileInputStream = new FileInputStream(IMAGE_PATH);
       
       // 스트리밍된 이미지를 클라이언트에게 반환
       InputStreamResource resource = new InputStreamResource(fileInputStream);

       // 응답에 이미지 스트림을 포함하여 반환
       return ResponseEntity.ok()
               .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=image.jpg")
               .contentType(MediaType.IMAGE_JPEG)
               .body(resource);
   }

//   
//   const tboard = {
//	   token: null,
//	   setToken: function(newToken) {
//	     this.token = newToken;
//	     console.log("토큰이 설정되었습니다:", newToken);
//	   }
//	 };
}


