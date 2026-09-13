import type { Profile as ProfileModel } from "@shared/model"
import { IconAlertCircle, IconMail, IconPhone, IconUser } from "@tabler/icons-react"
import Image from "next/image"
import Detail from "@/app/(main)/sections/main/detail"

export default function Profile({
  name,
  headline,
  gender,
  age,
  phone,
  email,
  avatar,
  details,
}: Readonly<ProfileModel>) {
  const baseInfo = [gender, age].filter(Boolean).join(" | ")

  return (
    <section className="flex items-center gap-6">
      <div className="min-w-0 flex-1 flex flex-col items-center">
        <h1 className="text-3xl font-bold">{name}</h1>
        {headline && <p>{headline}</p>}

        <div className="mt-2 flex flex-col items-center gap-y-1">
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
            {baseInfo && <Detail icon={IconUser} content={baseInfo} />}
            {phone && <Detail icon={IconPhone} content={phone} />}
            {email && <Detail icon={IconMail} content={email} />}
          </div>

          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
            {details.map((detail, index) => (
              <Detail
                key={index}
                icon={IconAlertCircle}
                content={detail.content}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="relative w-24 aspect-[5/7] shrink-0 overflow-hidden rounded-md bg-muted">
        {avatar
          ? (
              <Image
                src={avatar.url}
                alt={name}
                fill
                sizes="6rem"
                className="object-cover"
              />
            )
          : <IconUser className="absolute inset-0 m-auto size-10 text-muted-foreground" />}
      </div>
    </section>
  )
}
