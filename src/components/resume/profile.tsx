import type { ProfileNode } from "@shared/model/node"
import { IconMail, IconPhone, IconUser } from "@tabler/icons-react"
import Image from "next/image"
import Detail from "@/components/resume/detail"
import { useNode } from "@/hooks/node"
import { useResume } from "@/hooks/resume"

export default function Profile() {
  const { profileRootId } = useResume()
  const node = useNode(profileRootId ?? "") as ProfileNode | undefined

  if (!node)
    return null

  const { name, headline, gender, age, phone, email, avatar } = node.self
  const detailIds = node.children

  const baseInfo = [gender, age].filter(Boolean).join(" | ")

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
            {detailIds.map(id => (
              <Detail key={id} id={id} />
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
