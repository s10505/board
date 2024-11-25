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
package kr.or.kosha.tboard.service;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import kr.or.kosha.tboard.boot.web.DataUtil;
import kr.or.kosha.tboard.boot.web.TboardUtil;

/**
 * @Class Name : EgovSampleServiceImpl.java
 * @Description : Sample Business Implement Class
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

@Service("tboardService")
public class TboardService extends EgovAbstractServiceImpl {

	private static final Logger LOGGER = LoggerFactory.getLogger(TboardService.class);

	
	
	public DataUtil process(TboardUtil tboardUtil) throws Exception {
		DataUtil rtnDataUtil = new DataUtil();
		
		try {
			DataUtil inDataUtil = new DataUtil();
			
			rtnDataUtil = this.permission(inDataUtil);
			
			
			
		} catch (CustomException e) {
			throw e;
		} catch (Exception e) {
			throw e; 
		}
		
		return rtnDataUtil;
	}
	
	public DataUtil permission(DataUtil dataUtil) throws Exception {
		DataUtil rtnDataUtil = new DataUtil();
	
		try {
			DataUtil inDataUtil = new DataUtil();
			
			if (inDataUtil.getCode() != null) {
				throw new CustomException("-1", "값에러");
			}
			
			//조회 1
			JSONObject allOptGrid = this.optionDatas();
			
			//조회 2
			JSONObject myOptGrid = this.myoptDatas();
			
			//조회 3
			JSONObject artclList = this.artclDatas();
			
			
			JSONArray arrMyOpt = (JSONArray)myOptGrid.get("data");
			String pOptCode = "";
			String optCode  = "";
			
			JSONArray rtnArrMyOpt = new JSONArray();
			for (Object object : arrMyOpt) {
				JSONObject jsonObject = new JSONObject();;	
				pOptCode = (String)((JSONObject)object).get("PARENT_OPTION_CODE");
				optCode =  (String)((JSONObject)object).get("OPTION_CODE");
				
				String optCd = pOptCode + "." + optCode;
				jsonObject.put("optCd", optCd);
				jsonObject.put("hash", this.generateHash(optCd));
				rtnArrMyOpt.add(jsonObject);
			}
			
			
			System.out.println( "##################" );
			System.out.println( allOptGrid.toJSONString() );
			System.out.println( "##################" );
			System.out.println( rtnArrMyOpt.toJSONString()  );
			System.out.println( "##################" );
			
			JSONObject rtnObject = new JSONObject();
			rtnObject.put("fullOptions", allOptGrid.get("data"));
			rtnObject.put("userOptions", rtnArrMyOpt);
			rtnObject.put("artclList", artclList.get("data"));
			
			rtnDataUtil.setData(rtnObject);
			
		} catch (CustomException e) {
			throw e;
		} catch (Exception e) {
			throw e;
		}
		
		return rtnDataUtil;
	}


	public DataUtil callKdc(DataUtil dataUtil) throws Exception {
		DataUtil rtnDataUtil = new DataUtil();
		String rtnCode = "0";
		
		String code    = "";
		String msg     = "";
		String subCode = "";
		String subMsg  = "";
		
		try {
		
			System.out.println("--------------------callKdc");
			code    = "200";
			msg     = "200msg";
			subCode = "200subCode";
			subMsg  = "200subMsg";

			if ("200".equals(code)) {
				throw new CustomException(code, msg, subCode, subMsg);
			}
			
			System.out.println(code);
			System.out.println(msg);
			System.out.println(subCode);
			System.out.println(subMsg);
			
			System.out.println("--------------------callKdc");
			
		} catch (CustomException e) {
			throw e;
		} catch (Exception e) {
			throw new CustomException("500", "KDC 오류");
		}
		
		rtnDataUtil.setCode(rtnCode);
		
		return rtnDataUtil;
	}

	public JSONObject optionDatas() {
		String[][] data = {
            {"", "basic", ""},
            {"", "reply", ""},
            {"", "comment", ""},
            {"", "replycomment", ""},
            {"", "attach", ""},
            {"", "notice", ""},
            {"basic", "access", ""},
            {"basic", "read", ""},
            {"basic", "save", ""},
            {"basic", "delete", ""},
            {"basic", "manage", ""},
            {"reply", "access", ""},
            {"reply", "read", ""},
            {"reply", "save", ""},
            {"reply", "delete", ""},
            {"reply", "manage", ""},
            {"comment", "read", ""},
            {"comment", "save", ""},
            {"comment", "delete", ""},
            {"comment", "manage", ""},
            {"replycomment", "read", ""},
            {"replycomment", "save", ""},
            {"replycomment", "delete", ""},
            {"replycomment", "manage", ""},
            {"attach", "download", ""},
            {"attach", "upload", ""},
            {"attach", "manage", ""},
            {"notice", "save", ""},
            {"notice", "manage", ""},
            {"", "viewcnt", "5"},
            {"", "bbstype", "list"},
            {"", "treereply", "N"},
            {"", "confirm", "N"}
        };

        // JSONArray 생성
        JSONArray jsonArray = new JSONArray();

        // 각 데이터를 JSON 객체로 변환 후 배열에 추가
        for (String[] row : data) {
            JSONObject jsonObject = new JSONObject();
            jsonObject.put("prntOptCode", row[0]);
            jsonObject.put("mainOptCode", row[1]);
            jsonObject.put("value", row[2]);
            jsonArray.add(jsonObject);
        }
        JSONObject rtnObject = new JSONObject();
        rtnObject.put("data", jsonArray);
        
		return rtnObject;
	}
	
	
	public JSONObject myoptDatas() {
		String[][] data = {
            {"basic", "manage"},
            {"reply", "manage"},
            {"comment", "manage"},
            {"replycomment", "manage"},
            {"attach", "manage"},
            {"notice", "manage"},
        };

        // JSONArray 생성
        JSONArray jsonArray = new JSONArray();

        // 각 데이터를 JSON 객체로 변환 후 배열에 추가
        for (String[] row : data) {
            JSONObject jsonObject = new JSONObject();
            jsonObject.put("PARENT_OPTION_CODE", row[0]);
            jsonObject.put("OPTION_CODE", row[1]);
            jsonArray.add(jsonObject);
        }
        
        JSONObject rtnObject = new JSONObject();
        rtnObject.put("data", jsonArray);
        
		return rtnObject;
	}
	
	
	public JSONObject artclDatas() {
		String[][] data = {
            {"search", "control", "ALL", "{\"C01010001\":{\"req\":\"\", \"prm\": \"N\", \"enc\":\"\", \"len\":\"50\"}}", ""},
            {"search", "control", "ALL", "{\"C01010002\":{\"req\":\"Y\", \"prm\": \"N\", \"enc\":\"\", \"len\":\"20\"}}", ""},
            {"search", "control", "ALL", "{\"C01010003\":{\"req\":\"Y\", \"prm\": \"N\", \"enc\":\"\", \"len\":\"30\"}}", ""},
            {"search", "control", "ALL", "{\"C01010004\":{\"req\":\"N\", \"prm\": \"N\", \"enc\":\"\", \"len\":\"40\"}}", ""},
            {"search", "control", "ALL", "{\"C01010005\":{\"req\":\"N\", \"prm\": \"N\", \"enc\":\"\", \"len\":\"50\"}}", ""},
            {"search", "sort", "ALL", "{\"1\":\"C01010001\", \"2\": \"C01010002\", \"3\":\"C01010003\", \"4\":\"C01010004\", \"5\":\"C01010005\"}", ""},
        };

        // JSONArray 생성
        JSONArray jsonArray = new JSONArray();

        // 각 데이터를 JSON 객체로 변환 후 배열에 추가
        for (String[] row : data) {
            JSONObject jsonObject = new JSONObject();
            jsonObject.put("fldStngCd", row[0]);
            jsonObject.put("viewStngCd", row[1]);
            jsonObject.put("resultType", row[2]);
            jsonObject.put("fldStngCn", row[3]);
            jsonObject.put("viewStngCn", row[4]);
            jsonArray.add(jsonObject);
        }
        
        JSONObject rtnObject = new JSONObject();
        rtnObject.put("data", jsonArray);
        
		return rtnObject;
	}
	
	

    // SHA-256 해시 생성 함수
    public static String generateHash(String input) {
        try {
            // MessageDigest 객체 생성 (SHA-256 알고리즘 사용)
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            
            // 입력 문자열을 바이트 배열로 변환하고 해시 계산
            byte[] hashBytes = digest.digest(input.getBytes());
            
            // 바이트 배열을 16진수로 변환
            StringBuilder hexString = new StringBuilder();
            for (byte b : hashBytes) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            
            // 최종적으로 생성된 해시 값 반환
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            // SHA-256 알고리즘이 없는 경우 예외 처리
            throw new RuntimeException("Error: Algorithm not found", e);
        }
    }
}

