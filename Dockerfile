# Node.js v14 이미지를 기반으로 새 Docker 이미지를 생성
FROM node:14

# Docker 컨테이너 내에서 작업 디렉토리를 /app로 설정
WORKDIR /app

# package.json과 package-lock.json을 Docker 컨테이너 내의 /app 디렉토리로 복사
COPY package*.json ./

# 의존성 패키지들을 설치
RUN npm install

# 현재 디렉토리의 모든 파일과 디렉토리를 Docker 컨테이너 내의 /app 디렉토리로 복사
COPY . .

# 프로덕션용 리액트 애플리케이션을 빌드
RUN npm run build

# Docker 컨테이너의 80번 포트를 외부로 노출
EXPOSE 80

# Docker 컨테이너가 실행될 때 serve 명령을 실행하여 빌드된 리액트 애플리케이션을 제공
CMD ["npx", "serve", "-s", "build", "-l", "80"]
