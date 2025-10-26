import { create } from "zustand";
import Container from "../materials/container";
import Button from "../materials/button";
import Page from "../materials/page";
import Header from "../materials/header";
import Input from "../materials/input";
import Image from "../materials/image";
import Text from "../materials/text";
import Div from "../materials/div";

export interface ComponentConfig {
    name: string;
    defaultProps: Record<string, any>;
    component: any;
    desc: string;
    setters?:ComponentSetter[];
}
export interface ComponentSetter {
    name: string;
    label: string;
    type: string;
    options?: string;
    [key: string]: any
}

export interface State {
    componentConfig: { [key: string]: ComponentConfig }

}
export interface Action {
    registerComponent: (name: string, componentConfig: ComponentConfig) => void;
}

//组件对应名字
export const useComponentConfigStore = create<State & Action>(
    (set) => ({
        componentConfig: {
            Container: {
                name: 'Container',
                defaultProps: {},
                component: Container,
                desc: '容器'
            },
            Button: {
                name: 'Button',
                defaultProps: {
                    text: '按钮',
                    type: 'default',
                    size: 'middle',
                    shape: 'round'
                },
                setters:[
                    {
                        name:'text',
                        label:'文本',
                        type:'input'
                    },
                    {
                        name:'type',
                        label:'类型',
                        type:'select',
                        options:'default,primary,success,warning,danger,link'
                    },
                    {
                        name:'size',
                        label:'大小',
                        type:'select',
                        options:'small,medium,large'
                    }
                ],
                component: Button,
                desc: '按钮'
            },
            Page: {
                name: 'Page',
                defaultProps: {},
                component: Page,
                desc: '页面'
            },
            Header: {
                name: 'Header',
                defaultProps: {
                    title: '我是标题',
                    level: 1,
                    align: 'left',
                    color: '#1f2937'
                },
                component: Header,
                desc: '标题'
            },
            Input: {
                name: 'Input',
                defaultProps: {
                    placeholder: '请输入内容',
                    value: '',
                    size: 'middle',
                    allowClear: true
                },
                component: Input,
                desc: '输入框'
            },
            Image: {
                name: 'Image',
                defaultProps: {
                    src: 'https://via.placeholder.com/300x200?text=图片',
                    alt: '图片',
                    width: '100%',
                    height: 'auto',
                    objectFit: 'cover'
                },
                component: Image,
                desc: '图片'
            },
            Text: {
                name: 'Text',
                defaultProps: {
                    content: '这是一段文本',
                    fontSize: 14,
                    color: '#333333',
                    textAlign: 'left'
                },
                component: Text,
                desc: '文本'
            },
            Div: {
                name: 'Div',
                defaultProps: {
                    backgroundColor: 'transparent',
                    padding: 10,
                    minHeight: 50,
                    border: '1px solid #e0e0e0'
                },
                component: Div,
                desc: '通用容器'
            }
        },
        registerComponent: (name, componentConfig) => {
            set((state) => ({
                ...state,
                componentConfig: {
                    ...state.componentConfig,
                    [name]: componentConfig
                }
            }))
        }
    })
)