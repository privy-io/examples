import { usePrivy } from "@privy-io/react-auth";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import React, { useEffect, useState } from "react";
import miniappSdk, { Context } from "@farcaster/miniapp-sdk";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
const UserInfo = () => {
  const { user } = usePrivy();
  const [context, setContext] = useState<Context.MiniAppContext>();
  useEffect(() => {
    miniappSdk.context.then((context) => {
      setContext(context);
    });
  }, []);
  return (
    <Accordion type="single" collapsible>
      {context && (
        <AccordionItem value="item-1">
          <AccordionTrigger>Farcaster User Context</AccordionTrigger>
          <AccordionContent>
            <pre> {JSON.stringify(context, null, 2)}</pre>
          </AccordionContent>
        </AccordionItem>
      )}
      <AccordionItem value="item-2">
        <AccordionTrigger>Privy User Object</AccordionTrigger>
        <AccordionContent>
          <pre>{JSON.stringify(user, null, 2)}</pre>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default UserInfo;
