
import { ScheduleCourse } from "@/types/schedule";

/**
 * 시간표 데이터를 URL로 공유하기 위한 Base64 인코딩 함수
 */
export const encodeScheduleToBase64 = (courses: ScheduleCourse[]): string => {
  try {
    // 공유에 필요한 최소 데이터만 추출
    const simplifiedCourses = courses.map(course => ({
      name: course.name,
      code: course.code,
      day: course.day,
      startTime: course.startTime,
      endTime: course.endTime,
      location: course.location,
      credit: course.credit
    }));

    // JSON으로 변환 후 Base64로 인코딩
    const jsonData = JSON.stringify({
      courses: simplifiedCourses,
      timestamp: new Date().toISOString(),
      version: "1.0"
    });

    // URL에서 안전하게 사용할 수 있는 Base64 인코딩 (URL-safe Base64)
    return btoa(jsonData)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  } catch (error) {
    console.error('Error encoding schedule:', error);
    throw new Error('시간표 인코딩 중 오류가 발생했습니다.');
  }
};

/**
 * Base64로 인코딩된 시간표 데이터를 디코딩하는 함수
 */
export const decodeScheduleFromBase64 = (encodedString: string): ScheduleCourse[] => {
  try {
    // URL-safe Base64 디코딩
    const base64 = encodedString
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    // Base64 디코딩 후 JSON 파싱
    const jsonData = atob(base64);
    const parsedData = JSON.parse(jsonData);
    
    if (!parsedData.courses || !Array.isArray(parsedData.courses)) {
      throw new Error('유효하지 않은 시간표 형식입니다.');
    }
    
    // 각 과목에 고유 ID 부여
    return parsedData.courses.map((course: any) => ({
      ...course,
      id: `shared-${Math.random().toString(36).substring(2, 9)}` // 고유 ID 생성
    }));
  } catch (error) {
    console.error('Error decoding schedule:', error);
    throw new Error('시간표 디코딩 중 오류가 발생했습니다.');
  }
};

/**
 * 현재 URL에 인코딩된 시간표가 있는지 확인하는 함수
 */
export const getSharedScheduleFromUrl = (): ScheduleCourse[] | null => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const encodedSchedule = urlParams.get('schedule');
    
    if (!encodedSchedule) return null;
    
    return decodeScheduleFromBase64(encodedSchedule);
  } catch (error) {
    console.error('Error getting shared schedule from URL:', error);
    return null;
  }
};

/**
 * 시간표 공유 URL 생성 함수
 */
export const createShareableLink = (courses: ScheduleCourse[]): string => {
  try {
    const encodedSchedule = encodeScheduleToBase64(courses);
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?schedule=${encodedSchedule}`;
  } catch (error) {
    console.error('Error creating shareable link:', error);
    throw new Error('공유 링크 생성 중 오류가 발생했습니다.');
  }
};
