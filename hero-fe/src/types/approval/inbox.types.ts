/**
 * <pre>
 * File Name: inbox.ts
 * Description: 알림 시스템 타입 정의
 *              백엔드 DTO, 프론트엔드 모델, WebSocket 관련 타입 정의
 *
 * 주요 타입:
 * - DocumentsResponseDTO: 문서에 대한 기본 정보를 포함한 응답 DTO
 * - DocumentDetailResponseDTO: 결재 문서번호로 조회한 상세페이지조회를 위한 응답 DTO
 *
 * History
 * 2025/12/17 (민철) 최초 작성
 * </pre>
 *
 * @author 민철
 * @version 1.0
 */

/**
 * 문서함 문서목록 조회 DTO
 * @description 백엔드 목록 조회 응답 DTO
 * @property {number} docId:        결재문서PK
 * @property {string} docNo:        문서번호
 * @property {string} docStatus:    결재상태
 * @property {string} category:     문서분류
 * @property {string} name:         문서서식
 * @property {string} title:        문서제목
 * @property {string} drafterDept:  부서(기안자부서)
 * @property {string} drafter:      상신자(=기안자)
 * @property {string} drafterAt:    상신일시
 * 
 */
export interface DocumentsResponseDTO {
  docId: number;
  docNo: string;
  docStatus: string;
  category: string;
  name: string;
  title: string;
  drafterDept: string;
  drafter: string;
  draftAt: string;
};