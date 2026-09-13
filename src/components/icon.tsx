import type { IconProps as TablerIconProps } from "@tabler/icons-react"
import {
  IconAward,
  IconBackpack,
  IconBook,
  IconBrain,
  IconBrandGithub,
  IconBrandLinkedin,
  IconBriefcase,
  IconBuilding,
  IconBulb,
  IconCake,
  IconCalendar,
  IconCalendarEvent,
  IconCamera,
  IconCertificate,
  IconChartBar,
  IconCloud,
  IconCode,
  IconCompass,
  IconCpu,
  IconDatabase,
  IconDeviceLaptop,
  IconFlag,
  IconHeart,
  IconHelp,
  IconHierarchy,
  IconHome,
  IconIdBadge,
  IconLanguage,
  IconLink,
  IconMail,
  IconMapPin,
  IconMedal,
  IconMicroscope,
  IconNotebook,
  IconPalette,
  IconPhone,
  IconPuzzle,
  IconRobot,
  IconRocket,
  IconSchool,
  IconServer,
  IconSparkles,
  IconStar,
  IconTarget,
  IconTerminal,
  IconTool,
  IconTrophy,
  IconUser,
  IconUsersGroup,
  IconVocabulary,
  IconWorld,
} from "@tabler/icons-react"

/**
 * @description 按 kebab 名分发 tabler 图标
 */
export default function Icon({
  name,
  ...props
}: Readonly<{
  name: string
} & TablerIconProps>) {
  if (!name) {
    return null
  }

  switch (name) {
    // 联系与个人信息
    case "phone": return <IconPhone {...props} />
    case "mail": return <IconMail {...props} />
    case "map-pin": return <IconMapPin {...props} />
    case "home": return <IconHome {...props} />
    case "cake": return <IconCake {...props} />
    case "calendar": return <IconCalendar {...props} />
    case "user": return <IconUser {...props} />
    case "id-badge": return <IconIdBadge {...props} />
    case "world": return <IconWorld {...props} />
    case "link": return <IconLink {...props} />
    case "brand-github": return <IconBrandGithub {...props} />
    case "brand-linkedin": return <IconBrandLinkedin {...props} />

    // 教育 / 学业
    case "school": return <IconSchool {...props} />
    case "book": return <IconBook {...props} />
    case "notebook": return <IconNotebook {...props} />
    case "certificate": return <IconCertificate {...props} />
    case "backpack": return <IconBackpack {...props} />
    case "microscope": return <IconMicroscope {...props} />
    case "language": return <IconLanguage {...props} />
    case "vocabulary": return <IconVocabulary {...props} />

    // 工作 / 项目
    case "briefcase": return <IconBriefcase {...props} />
    case "building": return <IconBuilding {...props} />
    case "hierarchy": return <IconHierarchy {...props} />
    case "users-group": return <IconUsersGroup {...props} />
    case "target": return <IconTarget {...props} />
    case "rocket": return <IconRocket {...props} />
    case "calendar-event": return <IconCalendarEvent {...props} />
    case "chart-bar": return <IconChartBar {...props} />

    // 技能 / 技术
    case "code": return <IconCode {...props} />
    case "terminal": return <IconTerminal {...props} />
    case "database": return <IconDatabase {...props} />
    case "server": return <IconServer {...props} />
    case "cloud": return <IconCloud {...props} />
    case "device-laptop": return <IconDeviceLaptop {...props} />
    case "cpu": return <IconCpu {...props} />
    case "robot": return <IconRobot {...props} />
    case "brain": return <IconBrain {...props} />
    case "palette": return <IconPalette {...props} />
    case "camera": return <IconCamera {...props} />
    case "tool": return <IconTool {...props} />

    // 荣誉 / 成果
    case "trophy": return <IconTrophy {...props} />
    case "medal": return <IconMedal {...props} />
    case "award": return <IconAward {...props} />
    case "star": return <IconStar {...props} />
    case "sparkles": return <IconSparkles {...props} />
    case "bulb": return <IconBulb {...props} />
    case "puzzle": return <IconPuzzle {...props} />

    // 通用 / 其他
    case "heart": return <IconHeart {...props} />
    case "compass": return <IconCompass {...props} />
    case "flag": return <IconFlag {...props} />

    default: return <IconHelp {...props} />
  }
}
