import { create } from 'zustand';
import Container from '../materials/container';
import Button from '../materials/button';
import Page from '../materials/page';
import Header from '../materials/header';
import Input from '../materials/input';
import TextArea from '../materials/textarea';
import SelectField from '../materials/select-field';
import RadioGroupField from '../materials/radio-group';
import CheckboxGroupField from '../materials/checkbox-group';
import Image from '../materials/image';
import Text from '../materials/text';
import Div from '../materials/div';
import Title from '../materials/title';
import Shape from '../materials/shape';
import Divider from '../materials/divider';
import Icon from '../materials/icon';

export interface ComponentConfig {
    name: string;
    defaultProps: Record<string, any>;
    component: any;
    desc: string;
    category?: string;
    setters?: ComponentSetter[];
}

export interface ComponentSetter {
    name: string;
    label: string;
    type: string;
    options?: string;
    [key: string]: any;
}

export interface State {
    componentConfig: { [key: string]: ComponentConfig };
}

export interface Action {
    registerComponent: (name: string, componentConfig: ComponentConfig) => void;
}

export const useComponentConfigStore = create<State & Action>((set) => ({
    componentConfig: {
        Container: {
            name: 'Container',
            defaultProps: {
                style: {
                    backgroundColor: 'transparent',
                },
            },
            component: Container,
            desc: 'Poster Group',
            category: 'Poster',
        },
        Div: {
            name: 'Div',
            defaultProps: {
                backgroundColor: '#ffffff',
                padding: 12,
                minHeight: 50,
                border: '1px solid #e0e0e0',
                borderRadius: 12,
            },
            component: Div,
            desc: 'Shape Block',
            category: 'Poster',
        },
        Text: {
            name: 'Text',
            defaultProps: {
                content: 'Poster text',
                fontSize: 14,
                color: '#333333',
                textAlign: 'left',
            },
            component: Text,
            desc: 'Body Text',
            category: 'Poster',
        },
        Header: {
            name: 'Header',
            defaultProps: {
                title: 'Poster Title',
                level: 2,
                align: 'center',
                color: '#1f2937',
            },
            component: Header,
            desc: 'Headline',
            category: 'Poster',
        },
        Title: {
            name: 'Title',
            defaultProps: {
                text: 'Main Title',
                fontSize: 48,
                fontWeight: 700,
                color: '#111827',
                textAlign: 'left',
            },
            component: Title,
            desc: 'Poster Title',
            category: 'Poster',
        },
        Input: {
            name: 'Input',
            defaultProps: {
                placeholder: 'Please enter',
                value: '',
                size: 'middle',
                allowClear: true,
            },
            component: Input,
            desc: 'Single-line Input',
            category: 'Form',
        },
        TextArea: {
            name: 'TextArea',
            defaultProps: {
                placeholder: 'Please enter long text',
                rows: 4,
            },
            component: TextArea,
            desc: 'Multi-line Input',
            category: 'Form',
        },
        Select: {
            name: 'Select',
            defaultProps: {
                placeholder: 'Please select',
                options: ['Option A', 'Option B', 'Option C'],
            },
            component: SelectField,
            desc: 'Dropdown Select',
            category: 'Form',
        },
        RadioGroup: {
            name: 'RadioGroup',
            defaultProps: {
                options: ['Option A', 'Option B', 'Option C'],
                direction: 'vertical',
            },
            component: RadioGroupField,
            desc: 'Single Choice',
            category: 'Form',
        },
        CheckboxGroup: {
            name: 'CheckboxGroup',
            defaultProps: {
                options: ['Option A', 'Option B', 'Option C'],
                direction: 'vertical',
            },
            component: CheckboxGroupField,
            desc: 'Multiple Choice',
            category: 'Form',
        },
        Button: {
            name: 'Button',
            defaultProps: {
                text: 'Call To Action',
                type: 'primary',
                size: 'middle',
                shape: 'round',
            },
            component: Button,
            desc: 'Button',
            category: 'Form',
        },
        Page: {
            name: 'Page',
            defaultProps: {
                preset: 'poster_story',
                backgroundColor: '#ffffff',
            },
            component: Page,
            desc: 'Poster Canvas',
            category: 'Poster',
        },
        Image: {
            name: 'Image',
            defaultProps: {
                src: 'https://via.placeholder.com/300x200?text=Image',
                alt: 'Image',
                width: '100%',
                height: 'auto',
                objectFit: 'cover',
            },
            component: Image,
            desc: 'Image',
            category: 'Poster',
        },
        Shape: {
            name: 'Shape',
            defaultProps: {
                fill: '#111827',
                stroke: 'transparent',
                strokeWidth: 0,
                radius: 16,
            },
            component: Shape,
            desc: 'Color Block',
            category: 'Poster',
        },
        Divider: {
            name: 'Divider',
            defaultProps: {
                direction: 'horizontal',
                color: '#d1d5db',
                thickness: 2,
                lineStyle: 'solid',
            },
            component: Divider,
            desc: 'Divider Line',
            category: 'Poster',
        },
        Icon: {
            name: 'Icon',
            defaultProps: {
                icon: 'star',
                size: 28,
                color: '#111827',
            },
            component: Icon,
            desc: 'Decorative Icon',
            category: 'Poster',
        },
    },
    registerComponent: (name, componentConfig) => {
        set((state) => ({
            ...state,
            componentConfig: {
                ...state.componentConfig,
                [name]: componentConfig,
            },
        }));
    },
}));
