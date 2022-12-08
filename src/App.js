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
} from "antd";
import { Content, Footer, Header } from "antd/es/layout/layout";
import "antd/dist/reset.css";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism.css"; //Example style, you can use another
import { useState } from "react";
import useCustomState from "./hooks/useCustomState";
import { parse, stringify } from "yaml";

import { UploadOutlined } from "@ant-design/icons";
import readXlsxFile, { readSheetNames } from "read-excel-file";

// const convertMethod = [
//   {
//     label: "nlu",
//     value: 10,
//   },
//   {
//     label: "stories",
//     value: 20,
//   },
// ];

function App() {
  const [state, setState] = useCustomState({
    codeRight: "",
    codeLeft: "",
    fileList: [],
    listSheets: [],
  });

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
    });
  };

  const handleChangeSheet = (value) => {
    setState({
      currentSheet: value,
    });
  };
  const handleConvertToYML = () => {
    let file = (state?.fileList || [])[0]?.originFileObj;

    const fileMapping = {
      INTENT: "intent",
      EXAMPLE: "examples",
      RESPONSE: "response",
    };

    readXlsxFile(file, { sheet: state.currentSheet, map: fileMapping }).then(
      (rows) => {
        console.log(rows);
      }
    );
  };
  console.log(state?.currentSheet);

  return (
    <div className="App">
      <Layout className="app-container">
        <Header className="app-header">
          <Avatar src="https://scontent-hkg4-2.xx.fbcdn.net/v/t1.6435-1/121374492_1872796492863064_241720542867132126_n.jpg?stp=dst-jpg_p320x320&_nc_cat=111&ccb=1-7&_nc_sid=7206a8&_nc_ohc=ZWiczW7Asr8AX-MI1jk&_nc_oc=AQnyjni4Df0Ds7jeZWnk3DWcvbzTA8LqGvBOScg8FpTAqWVSnnfkKXp1HHFfhH6k3kY&_nc_ht=scontent-hkg4-2.xx&oh=00_AfAlSg09XeM23zWT9dOQElLAgGhnoVM6vW2taAzUeUE_TQ&oe=63B98D61" />
          <Button>Guide</Button>
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
        <Footer className="app-footer">Footer</Footer>
      </Layout>
    </div>
  );
}

export default App;
