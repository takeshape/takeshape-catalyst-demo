'use client';

import { AiChatWidget, AiChatWidgetProps } from '@takeshape/react-chat-agent';
import { markdownBlock } from '@takeshape/react-chat-agent/blocks/markdown';
import {
  createReferenceBlock,
  ReferenceComponent,
} from '@takeshape/react-chat-agent/blocks/reference';

import { AddToCartForm } from '@/vibes/soul/primitives/compare-card/add-to-cart-form';
import { addToCart } from '~/app/[locale]/(default)/compare/_actions/add-to-cart';
import { Image } from '~/components/image';
import { Link } from '~/components/link';
import { useCallback, useState } from 'react';
import { getCartId, setCartId } from '~/lib/cart';

interface ProductReference {
  entityId: number;
  title: string;
  imageUrl?: string;
  path: string;
}

function isProductReference(data: unknown): data is ProductReference {
  return typeof data === 'object' && data !== null && 'title' in data;
}

export interface ProductBlockContentProps {
  data: ProductReference;
}

const ProductBlockContent = ({ data }: ProductBlockContentProps) => {
  const { entityId, title, imageUrl, path } = data;

  return (
    <div className="my-4 rounded-lg p-4 shadow">
      <div className="flex h-32 items-center gap-4">
        <div className="w-1/3">
          {imageUrl ? (
            <Image
              alt="product"
              className="max-h-32 bg-white object-contain"
              height={128}
              src={imageUrl}
              width={100}
            />
          ) : (
            <div className="h-24 w-24 animate-pulse rounded-lg bg-gray-200" />
          )}
        </div>

        <div className="w-2/3">
          <Link href={path} prefetch="none">
            <div className="mb-3 block font-[family-name:var(--product-detail-title-font-family,var(--font-family-heading))] font-semibold hover:text-red-600">
              {title}
            </div>
          </Link>
          <AddToCartForm
            addToCartAction={addToCart}
            addToCartLabel="Add to cart"
            preorderLabel="Preorder"
            productId={String(entityId)}
            size="small"
          />
        </div>
      </div>
    </div>
  );
};

const ProductBlock: ReferenceComponent = ({ session, tid }) => {
  const data = session.references?.[tid];

  if (!isProductReference(data)) {
    return null;
  }

  return <ProductBlockContent data={data} />;
};

const productBlock = createReferenceBlock(ProductBlock, 'big-commerce:Product');

const productFragment = `#graphql
fragment ProductReference on TSSearchable {
  ...on BigCommerce_Product {
    entityId
    title
    imageUrl
    path
  }
}
`;

export interface AiChatProps {
  apiKey?: string;
  endpoint?: string;
}

type MessageResponse = Parameters<Required<AiChatWidgetProps>['onMessageResponse']>[0];

export function AiChat({ apiKey, endpoint }: AiChatProps) {
  const [agentCartId, setAgentCartId] = useState<string>();
  const handleMessage = useCallback(
    (response: MessageResponse) => {
      const cartId = response.sessionMemory?.cartId;

      // Sync the cart the agent is using with the cart the browser is using
      if (typeof cartId === 'string' && agentCartId !== cartId) {
        setAgentCartId(cartId);
        void setCartId(cartId);
      }
    },
    [agentCartId],
  );

  if (!apiKey || !endpoint) {
    return null;
  }

  return (
    <AiChatWidget
      agentName="brandedChat"
      apiKey={apiKey}
      blocks={[productBlock]}
      endpoint={endpoint}
      fallbackBlock={markdownBlock}
      inputName="brandedChat"
      onMessageResponse={handleMessage}
      referenceDataFragment={productFragment}
      welcomeMessage="Hi! How can I help you?"
    />
  );
}
