
FROM maven:3.9.6-amazoncorretto-17

RUN apt-get update && apt-get install -y rsync

COPY . /opt/
RUN cd /opt/ && ls && mvn clean package assembly:single -DskipTests

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/opt/target/grebi_metadata_service-1.0-SNAPSHOT-jar-with-dependencies.jar"]


