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
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.core.HttpHeaders;

import org.egovframe.rte.fdl.property.EgovPropertyService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import kr.or.kosha.tboard.boot.web.DataUtil;
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
}

