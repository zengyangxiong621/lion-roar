"use client";

import { Space, Button, Form, Input, Checkbox, Table, message } from "antd";
import { useState, useEffect } from "react";
import type { ColumnsType } from "antd/es/table";

// 修改接口类型
interface DataType {
  id: string;
  name: string;
  phone: string;
  notifications: string[];
  edit: boolean; // 替换 isEditing
}

// 添加接口请求函数
const fetchList = async () => {
  try {
    const response = await fetch("api/users");
    const { data } = await response.json();
    console.log("data", data);
    return data.map((item) => {
      item.notifications = [];
      if (item.notify_feishu) {
        item.notifications.push("notify_feishu");
      }
      if (item.notify_sms) {
        item.notifications.push("notify_sms");
      }
      if (item.notify_phone) {
        item.notifications.push("notify_phone");
      }
      return item;
    });
  } catch (err) {
    console.error(err);
    message.error("获取列表失败");
    return [];
  }
};

const deleteItem = async (id: string) => {
  try {
    await fetch(`api/users/${id}`, {
      method: "delete",
      headers: { "Csontent-Type": "application/json" },
    });
    return true;
  } catch (err) {
    console.error(err);
    message.error("删除失败");
    return false;
  }
};

const addItem = async (data: Omit<DataType, "id" | "isEditing">) => {
  console.log("adddata", data);
  try {
    const response = await fetch("api/users", {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    console.log("result", result);
    return result;
  } catch (err) {
    console.error(err);
    message.error("添加失败");
    return null;
  }
};

const editItem = async (id: string, data: Partial<DataType>) => {
  try {
    await fetch(`api/users/${id}`, {
      method: "put",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return true;
  } catch (error) {
    message.error("编辑失败", error);
    return false;
  }
};

export default function Home() {
  const [form] = Form.useForm();
  const [dataSource, setDataSource] = useState<DataType[]>([]);
  // 删除 editingKeys 状态

  useEffect(() => {
    fetchList().then((data) => {
      setDataSource(data.map((item: DataType) => ({ ...item, edit: false })));
    });
  }, []);

  const handleAdd = async () => {
    const newData: DataType = {
      id: null,
      name: "",
      phone: "",
      notifications: [],
      edit: true,
    };
    setDataSource([...dataSource, newData]);
  };

  const handleSave = async (id: string) => {
    try {
      const row = await form.validateFields();
      const newData = [...dataSource];
      const index = newData.findIndex((item) => id === item.id);

      if (index > -1) {
        // 转换表单数据格式
        const formattedData = {
          name: row[`${id}_name`],
          phone: row[`${id}_phone`],
          notify_feishu: row[`${id}_notifications`]?.includes("notify_feishu"),
          notify_sms: row[`${id}_notifications`]?.includes("notify_sms"),
          notify_phone: row[`${id}_notifications`]?.includes("notify_phone"),
        };

        console.log("formattedData", formattedData);

        if (id) {
          await editItem(id, formattedData);
        } else {
          await addItem(formattedData);
        }

        fetchList().then((data) => {
          setDataSource(
            data.map((item: DataType) => ({ ...item, edit: false }))
          );
        });
      }
    } catch (errInfo) {
      console.log("Validate Failed:", errInfo);
    }
  };

  const handleEdit = (id: string) => {
    setDataSource(
      dataSource.map((item) =>
        item.id === id ? { ...item, edit: true } : item
      )
    );
  };

  const handleDelete = async (id: string) => {
    const success = await deleteItem(id);
    if (success) {
      fetchList().then((data) => {
        setDataSource(data.map((item: DataType) => ({ ...item, edit: false })));
      });
    }
  };

  const columns: ColumnsType<DataType> = [
    {
      title: "姓名",
      dataIndex: "name",
      render: (text, record) => {
        return record.edit ? (
          <Form.Item
            name={`${record.id}_name`}
            rules={[{ required: true, message: "请输入姓名" }]}
            initialValue={text}
          >
            <Input />
          </Form.Item>
        ) : (
          text
        );
      },
    },
    {
      title: "手机号",
      dataIndex: "phone",
      render: (text, record) => {
        return record.edit ? (
          <Form.Item name={`${record.id}_phone`} initialValue={text}>
            <Input />
          </Form.Item>
        ) : (
          text
        );
      },
    },
    {
      title: "提醒方式",
      dataIndex: "notifications",
      render: (_, record) => {
        return record.edit ? (
          <Form.Item
            name={`${record.id}_notifications`}
            initialValue={record.notifications}
          >
            <Checkbox.Group>
              <Checkbox value="notify_feishu">飞书提醒</Checkbox>
              <Checkbox value="notify_sms">短信提醒</Checkbox>
              <Checkbox value="notify_phone">电话提醒</Checkbox>
            </Checkbox.Group>
          </Form.Item>
        ) : (
          <Space>
            {record.notifications?.map((item) => {
              const map = {
                notify_feishu: "飞书提醒",
                notify_sms: "短信提醒",
                notify_phone: "电话提醒",
              };
              return <span key={item} id={item}>{map[item as keyof typeof map]}</span>;
            })}
          </Space>
        );
      },
    },
    {
      title: "操作",
      render: (_, record) => {
        console.log("record", record);
        return record.edit ? (
          <Button type="link" onClick={() => handleSave(record.id)}>
            保存
          </Button>
        ) : (
          <Space>
            <Button type="link" onClick={() => handleEdit(record.id)}>
              编辑
            </Button>
            <Button type="link" danger onClick={() => handleDelete(record.id)}>
              删除
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <div className="p-8">
      <Form form={form}>
        <Space direction="vertical" style={{ width: "100%" }}>
          <Button type="primary" onClick={handleAdd}>
            添加新用户
          </Button>
          <Table
            dataSource={dataSource}
            columns={columns}
            pagination={false}
            rowKey="id"
          />
        </Space>
      </Form>
    </div>
  );
}
