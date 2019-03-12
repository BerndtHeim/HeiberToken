xcopy .\src\* .\docs /e /y
xcopy .\build\contracts\* .\docs /e /y
git add .
git commit -m "Github Pages"
git push -u origin master