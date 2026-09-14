import type { Profile as ProfileModel } from "@shared/model"
import { IconMail, IconPhone, IconUser } from "@tabler/icons-react"
import Image from "next/image"
import Detail from "@/components/resume/detail"
import { flatten } from "@/lib/collection"

export default function Profile({
  name,
  headline,
  gender,
  age,
  phone,
  email,
  avatar,
  detail,
}: Readonly<ProfileModel>) {
  const baseInfo = [gender, age].filter(Boolean).join(" | ")
  const details = flatten(detail)

  return (
    <section className="flex items-center gap-6">
      <div className="min-w-0 flex-1 flex flex-col items-center">
        <h1 className="text-3xl font-bold">{name}</h1>
        {headline && <p>{headline}</p>}

        <div className="mt-2 flex flex-col items-center gap-y-1">
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
            {baseInfo && (
              <div className="flex items-center gap-1">
                <IconUser className="size-4 shrink-0" />
                <span>{baseInfo}</span>
              </div>
            )}
            {phone && (
              <div className="flex items-center gap-1">
                <IconPhone className="size-4 shrink-0" />
                <span>{phone}</span>
              </div>
            )}
            {email && (
              <div className="flex items-center gap-1">
                <IconMail className="size-4 shrink-0" />
                <span>{email}</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
            {details.map(d => (
              <Detail
                key={d.id}
                {...d}
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
