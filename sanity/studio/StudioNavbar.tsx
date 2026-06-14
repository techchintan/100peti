"use client";

import {Box, Button, Flex} from "@sanity/ui";
import type {NavbarProps} from "sanity";

import {StudioIcons} from "./icons";

export function StudioNavbar(props: NavbarProps) {
  return (
    <Flex align="center">
      <Box flex={1}>{props.renderDefault(props)}</Box>
      <Box paddingRight={2}>
        <Button
          as="a"
          href="/"
          icon={StudioIcons.openDashboard}
          mode="bleed"
          target="_blank"
          rel="noopener noreferrer"
          text="Open Dashboard"
        />
      </Box>
    </Flex>
  );
}
