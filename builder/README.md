# 如何更新数据

1. 使用此处的 `Tools.java` 替换 grasscutter 原版 `Tools.java`, 运行后将 grasscutter 的 `GM Handbook` 目录下所有文件复制到 `.\handbooks` 

2. 将 grasscutter resource 下的 `.\ExcelBinOutPut\ManualTextMapConfigData.json` 复制到 `.\Resources`
3. 将 grasscutter resource 下的 `.\textMap` 复制到 `.\Resources` 

4. 修改 `config.js` line 1 版本号和 `.\src\js\init.js` line 4 版本号

5. `node .\hoyolab-spider.js` 
6. `node .\prop-builder.js` 
7. 移动文件 `node .\data-mover.js` 
8. 补全缺失文件 `node .\file-copy.js`
