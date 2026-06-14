"use client";

import {Flex, Text} from "@sanity/ui";

import {StudioIcons} from "./icons";

export function StudioLogo() {
  return (
    <Flex align="center" gap={2} padding={3}>
      <StudioIcons.rupee />
      <Text size={1} weight="medium">
        Sudani Finance
      </Text>
    </Flex>
  );
}
