import logo from "./logo.svg";
import "./App.scss";
import {
  Avatar,
  Button,
  Layout,
  notification,
  Select,
  Switch,
  Upload,
  Tour,
} from "antd";
import { Content, Footer, Header } from "antd/es/layout/layout";
import "antd/dist/reset.css";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism.css"; //Example style, you can use another
import { useEffect, useMemo, useRef, useState } from "react";
import useCustomState from "./hooks/useCustomState";
import { parse, stringify } from "yaml";

import { UploadOutlined } from "@ant-design/icons";
import readXlsxFile, { readSheetNames } from "read-excel-file";
import { nonAccentVietnameseKeepCase } from "./utils";

const listConvertMethods = [
  {
    label: "nlu",
    value: 10,
  },
  {
    label: "stories",
    value: 20,
  },
];

function App() {
  const [state, setState] = useCustomState({
    codeRight: "",
    codeLeft: "",
    fileList: [],
    listSheets: [],
    convertResult: "",
    convertMethod: 10,
  });

  const footerRef = useRef(null);
  // const footerHeight = useMemo(() => {}, []);
  useEffect(() => {
    console.log(footerRef?.current);
  }, [footerRef]);

  const hightlightWithLineNumbers = (input, language) =>
    highlight(input, language)
      .split("\n")
      .map((line, i) => `<span class='editorLineNumber'>${i + 1}</span>${line}`)
      .join("\n");

  const changeEditorValue = (value, pos) => {
    setState({
      [`code${pos}`]: value,
    });
  };

  const handleUploadFile = ({ file, fileList, event }) => {
    setState({
      fileList: fileList,
    });
    if (file?.status === "done") {
      notification.success({
        message: "Upload file success!",
        description: "You 've successfully upload files",
      });
      readSheetNames(file?.originFileObj).then((sheetNames) => {
        setState({
          listSheets: sheetNames?.map((item) => ({
            label: item,
            value: item,
          })),
        });
      });
      console.log(file);
    } else if (file?.status === "error") {
      notification.success({
        message: "Upload file error!",
        description: "Smt bad have occured",
      });
    }
  };

  const handleRemoveFile = () => {
    setState({
      fileList: [],
      listSheets: [],
      currentSheet: null,
      codeLeft: "",
      codeRight: "",
    });
  };

  const handleChangeSheet = (value) => {
    setState({
      currentSheet: value,
    });
  };

  const handleChangeConvertMethod = (value) => {
    setState({
      convertMethod: value,
    });
  };

  const convertNLU = (rows) => {
    let nlu = [];
    let obj = {
      intent: "",
      examples: "",
    };
    let count = 0;
    for (let row of rows) {
      if (Object.keys(row)?.includes("intent")) {
        count += 1;
        if (count > 1) {
          let newObj = { ...obj };
          nlu.push(newObj);
        }

        obj["intent"] = nonAccentVietnameseKeepCase(row.intent)
          .split(" ")
          .join("_");
        obj["examples"] = "";
      }
      obj["examples"] += `- ${row.examples}\n`;
      console.log(obj);
    }

    let result = {
      version: "",
      nlu: nlu,
    };
    console.log(result);
    setState({
      codeRight: stringify(result),
    });
  };

  const convertStories = (rows) => {
    let stories = [];
    let obj = {
      rule: "",
      step: [],
    };
    let count = 0;
    let tempResponse = "";

    for (let row of rows) {
      if (Object.keys(row)?.includes("intent")) {
        count += 1;
        obj["rule"] =
          nonAccentVietnameseKeepCase(row.intent).split(" ").join("_") +
          " rule";

        let step_intent = {
          intent: nonAccentVietnameseKeepCase(row.intent),
        };

        let step_action;
        if (row?.response) {
          tempResponse = row?.response;
          step_action = {
            action: row?.response?.trim(),
          };
        } else {
          step_action = {
            action: tempResponse,
          };
        }

        obj.step.push(step_intent);
        obj.step.push(step_action);

        let newObj = { ...obj };
        stories.push(newObj);

        obj = {
          rule: "",
          step: [],
        };
      }
    }

    let result = {
      version: "",
      rules: stories,
    };

    setState({
      codeLeft: stringify(result),
    });
  };

  const handleConvertToYML = () => {
    let file = (state?.fileList || [])[0]?.originFileObj;

    const fileMapping = {
      INTENT: "intent",
      EXAMPLE: "examples",
      RESPONSE: "response",
    };

    readXlsxFile(file, { sheet: state.currentSheet, map: fileMapping })
      .then(({ rows }) => {
        console.log(rows);
        convertNLU(rows);
        convertStories(rows);
      })
      .catch((err) => {
        notification.error({
          message: "Read excel sheet error",
          description: err?.message,
        });
      });
  };

  const handleDownloadExcel = () => {
    window.open("/RASA-YML-FILE-IMPORT/template/Kịch bản tương tác.xlsx", "_blank");
  };

  return (
    <div className="App">
      <Layout className="app-container">
        <Header className="app-header">
          <Avatar src="https://scontent-hkg4-2.xx.fbcdn.net/v/t1.6435-1/121374492_1872796492863064_241720542867132126_n.jpg?stp=dst-jpg_p320x320&_nc_cat=111&ccb=1-7&_nc_sid=7206a8&_nc_ohc=ZWiczW7Asr8AX-MI1jk&_nc_oc=AQnyjni4Df0Ds7jeZWnk3DWcvbzTA8LqGvBOScg8FpTAqWVSnnfkKXp1HHFfhH6k3kY&_nc_ht=scontent-hkg4-2.xx&oh=00_AfAlSg09XeM23zWT9dOQElLAgGhnoVM6vW2taAzUeUE_TQ&oe=63B98D61" />
          <Button onClick={handleDownloadExcel}>Download excel template</Button>
        </Header>
        <div className="switch-method">
          {/* <Select options={[]} /> */}
          <Upload
            onChange={handleUploadFile}
            accept=".xlsx"
            method="GET"
            maxCount={1}
            fileList={state.fileList}
            onRemove={handleRemoveFile}
          >
            <Button icon={<UploadOutlined />}>Click to Upload</Button>
          </Upload>
          {/* <Select
            placeholder="Chose convert type!"
            className="select-convert-method"
            options={listConvertMethods}
            onChange={handleChangeConvertMethod}
            value={state.convertMethod}
          /> */}
          <Select
            className="select-sheet"
            options={state.listSheets}
            placeholder="Please chose sheet to convert!"
            onChange={handleChangeSheet}
            value={state?.currentSheet}
          />
          <Button type="primary" onClick={handleConvertToYML}>
            Convert to YML
          </Button>
        </div>
        <Content className="app-content">
          <div className="editor-left">
            <h1>Rules</h1>
            <Editor
              value={state.codeLeft}
              onValueChange={(code) => changeEditorValue(code, "Left")}
              highlight={(code) =>
                hightlightWithLineNumbers(code, languages.js)
              }
              padding={10}
              textareaId="codeArea"
              className="editor"
              style={{
                fontFamily: '"Fira code", "Fira Mono", monospace',
                fontSize: 18,
                outline: 0,
              }}
            />
          </div>
          <div className="editor-right">
            <h1>NLU</h1>
            <Editor
              value={state.codeRight}
              onValueChange={(code) => changeEditorValue(code, "Right")}
              highlight={(code) =>
                hightlightWithLineNumbers(code, languages.js)
              }
              padding={10}
              textareaId="codeArea"
              className="editor"
              style={{
                fontFamily: '"Fira code", "Fira Mono", monospace',
                fontSize: 18,
                outline: 0,
              }}
            />
          </div>
        </Content>
        <Footer ref={footerRef} className="app-footer">
          Author: Hoàng Minh Sơn
        </Footer>
      </Layout>
    </div>
  );
}

export default App;
