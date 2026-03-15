# 마케팅 매칭 플랫폼

## 기술 스택
- Next.js 14 App Router + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (Auth + DB + Storage + RLS)
- Vercel 배포

## 자율 실행 규칙 ⚡
- 파일 수정/생성/삭제 시 허가 요청 금지
- git add, commit, push 허가 없이 직접 실행
- 중간에 나한테 확인하거나 질문 금지
- 작업 완료 후 결과만 보고

## 오류 처리 규칙
- 오류 발생 시 스스로 원인 파악 후 수정, 3회까지 재시도
- 3회 실패 시 다른 접근법으로 전환 (나한테 묻지 말 것)
- 복잡한 아키텍처 판단은 Opus 모델로 전환 후 해결, 이후 Sonnet 복귀
- Vercel 배포 오류는 로컬 빌드(`npm run build`)로 먼저 재현 후 수정

## 현재 오류 (우선 해결)
- 증상: `Application error: a client-side exception has occurred`
- 빌드는 성공, 런타임에서 터짐
- 원인 추정: use client 컴포넌트 hydration 오류 또는 Supabase 환경변수 미설정
- 해결 순서:
  1. 브라우저 콘솔 에러 메시지 확인
  2. Supabase 환경변수 Vercel에 등록됐는지 확인
  3. `use client` / `use server` 혼용 문제 확인
  4. 수정 후 자동 push → Vercel 재배포

## 금지 사항
- Must(M1~M6) 외 기능 구현 금지
- 설계서 외 테이블/컬럼 추가 금지
- 환경변수 하드코딩 금지
- 나한테 중간 확인 요청 금지
```

---

**지금 당장 오류 잡으려면** Claude Code에 이것만 던져:
```
브라우저에서 Application error 나고있어. 
빌드는 성공. 런타임 오류임.
Vercel 환경변수 확인하고, hydration 오류 찾아서 고쳐서 push까지 해.
중간에 나한테 묻지 마.