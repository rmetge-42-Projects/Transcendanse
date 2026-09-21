FROM owasp/modsecurity-crs:nginx-alpine 

COPY nginx.conf /etc/nginx/templates/conf.d/default.conf.template

COPY transcendance.key transcendance.crt /etc/nginx/ssl/

EXPOSE 80
EXPOSE 443


