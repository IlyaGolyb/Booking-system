@REM ----------------------------------------------------------------------------
@REM Licensed to the Apache Software Foundation (ASF) under one
@REM or more contributor license agreements.  See the NOTICE file
@REM distributed with this work for additional information
@REM regarding copyright ownership.  The ASF licenses this file
@REM to you under the Apache License, Version 2.0 (the
@REM "License"); you may not use this file except in compliance
@REM with the License.  You may obtain a copy of the License at
@REM
@REM    http://www.apache.org/licenses/LICENSE-2.0
@REM
@REM Unless required by applicable law or agreed to in writing,
@REM software distributed under the License is distributed on an
@REM "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
@REM KIND, either express or implied.  See the License for the
@REM specific language governing permissions and limitations
@REM under the License.
@REM ----------------------------------------------------------------------------

@REM ----------------------------------------------------------------------------
@REM Maven Start Up Batch script
@REM
@REM Required ENV vars:
@REM JAVA_HOME - location of a JDK home dir
@REM
@REM Optional ENV vars
@REM M2_HOME - location of maven2's installed home dir
@REM MAVEN_BATCH_ECHO - set to 'on' to enable the echoing of the batch commands
@REM MAVEN_BATCH_PAUSE - set to 'on' to wait for a keystroke before ending
@REM MAVEN_OPTS - parameters passed to the Java VM when running Maven
@REM     e.g. to debug Maven itself, use
@REM set MAVEN_OPTS=-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=y,address=8000
@REM MAVEN_SKIP_RC - flag to disable loading of mavenrc files
@REM ----------------------------------------------------------------------------

@if "%MAVEN_SKIP_RC%" == "" @setlocal
@set SKIP_RC=

@set MAVEN_CMD_LINE_ARGS=%*

@if "%MAVEN_BATCH_PAUSE%" == "on" pause

if "%MAVEN_DEBUG%" == "" @echo off

@setlocal enabledelayedexpansion

@set ERROR_CODE=0

:init
@set MAVEN_PROJECTBASEDIR=%CD%

@if "%MAVEN_BATCH_ECHO%" == "on"  echo %MAVEN_BATCH_ECHO%

@if "%MAVEN_JAVA_HOME%" == "" (
    echo Error: MAVEN_JAVA_HOME not found in your environment. >&2
    echo Please set the MAVEN_JAVA_HOME variable in your environment to match the >&2
    echo location of your Java installation. >&2
    exit /b 1
)

@set COMMAND=%MAVEN_JAVA_HOME%\bin\java.exe

if "%ERRORLEVEL%" == "0" (
    if exist "%COMMAND%" (
        echo Maven Wrapper
        "%COMMAND%" %MAVEN_OPTS% -classpath "%~dp0\.mvn\wrapper\maven-wrapper.jar" "-Dmaven.multiModuleProjectDirectory=%MAVEN_PROJECTBASEDIR%" org.apache.maven.wrapper.MavenWrapperMain %MAVEN_CMD_LINE_ARGS%
    ) else (
        echo Error: AVEN_JAVA_HOME is set to an invalid directory. >&2
        echo AVEN_JAVA_HOME = "%MAVEN_JAVA_HOME%" >&2
        echo Please set the AVEN_JAVA_HOME variable in your environment to match the >&2
        echo location of your Java installation. >&2
        exit /b 1
    )
)

@if "%ERRORLEVEL%" == "0" goto end

:fail
set ERROR_CODE=%ERRORLEVEL%

:end
@endlocal & set ERROR_CODE=%ERRORLEVEL%

if "%MAVEN_SKIP_RC%" == "" (
    if exist "%USERPROFILE%\.m2\wrapper\maven-wrapper.properties" (
        echo Loading user maven-wrapper.properties...
        set /a counter=0
        for /f "usebackq tokens=1* delims==" %%a in ("%USERPROFILE%\.m2\wrapper\maven-wrapper.properties") do (
            @set "MAVEN_PROJECTBASEDIR=%%b"
            set /a counter+=1
        )
        if "!counter!" gtr 0 echo Loaded !counter! entries from user maven-wrapper.properties
    )
)

set MAVEN_PROJECTBASEDIR=%CD%
if not "%MAVEN_SKIP_RC%" == "" goto skipRcPost

@if exist "%MAVEN_PROJECTBASEDIR%\mvnw.cmd" (
    echo Using mvnw.cmd from project directory...
) else (
    echo Error: mvnw.cmd not found in project directory. >&2
    echo Please run 'mvn -N io.takari:maven:wrapper' to generate it. >&2
)

:skipRcPost
@if "%MAVEN_BATCH_PAUSE%" == "on" pause

if "%MAVEN_TERMINATE_CMD%" == "on" exit %ERROR_CODE%

cmd /C exit %ERROR_CODE%