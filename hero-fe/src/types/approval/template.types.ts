/**
 * <pre>
 * File Name: template.types.ts
 * Description: template관련 객체 타입 정의
 *
 * 주요 타입:
 *
 * History
 * 2025/12/17 (민철) 최초 작성
 * </pre>
 *
 * @author 민철
 * @version 1.0
 */

/**
 * 문서서식 목록 조회 응답 DTO
 * @description 백엔드 문서 서식 응답 DTO
 * @property {number} id
 * @property {string} name
 * @property {string} templateKey
 * @property {string} category
 * @property {string} description
 * @property {boolean} bookmarking
 * 
 */
export interface DocumentTemplateDTO {
    id: number;
    name: string;
    templateKey: string;
    category: string;
    description: string;
    bookmarking: boolean;
};