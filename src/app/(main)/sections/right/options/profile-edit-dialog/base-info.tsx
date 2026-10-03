"use client"

import AvatarSection from "@/app/(main)/sections/right/options/profile-edit-dialog/avatar-section"
import PatchField from "@/components/patch-field"

/**
 * @description 个人信息基础字段 + 头像区块
 */
export default function BaseInfo({ id }: Readonly<{ id: string }>) {
  return (
    <div className="flex flex-col gap-4">
      <AvatarSection id={id} />

      <div className="grid grid-cols-2 gap-3">
        <PatchField
          id={id}
          field="name"
          label="姓名"
          placeholder="你的名字"
          className="col-span-2"
        />
        <PatchField
          id={id}
          field="headline"
          label="一句话简介"
          placeholder="例如: 前端工程师"
          className="col-span-2"
        />
        <PatchField
          id={id}
          field="age"
          label="年龄"
          placeholder="例如: 24"
        />
        <PatchField
          id={id}
          field="gender"
          label="性别"
          placeholder="例如: 男"
        />
        <PatchField
          id={id}
          field="phone"
          label="电话"
          placeholder="例如: 138 0000 0000"
        />
        <PatchField
          id={id}
          field="email"
          label="邮箱"
          placeholder="例如: you@example.com"
        />
      </div>
    </div>
  )
}
