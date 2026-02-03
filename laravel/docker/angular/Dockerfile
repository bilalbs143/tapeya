# Stage 1: Build the Angular app
FROM node:24-slim AS build
WORKDIR /usr/src/app
COPY ./angular/ .
RUN yarn install
RUN npm run build --prod

# Stage 2: Serve the Angular app with nginx
FROM nginx:alpine
COPY --from=build /usr/src/app/dist/Backoffice /usr/share/nginx/html
COPY ./docker/nginx/angular-template.conf /etc/nginx/conf.d/default.conf
EXPOSE 7070
CMD ["nginx", "-g", "daemon off;"]
