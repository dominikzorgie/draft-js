/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ContentBlockNode
 * @format
 * @flow
 *
 * This is unstable and not part of the public API and should not be used by
 * production systems. This file may be update/removed without notice.
 */

'use strict';

import type {BlockNode, BlockNodeConfig, BlockNodeKey} from 'BlockNode';
import type {DraftBlockType} from 'DraftBlockType';
import type {DraftInlineStyle} from 'DraftInlineStyle';

const CharacterMetadata = require('CharacterMetadata');
const Immutable = require('immutable');

const findRangesImmutable = require('findRangesImmutable');

const {List, Map, OrderedSet, Record, Repeat} = Immutable;

type ContentBlockNodeConfig = BlockNodeConfig & {
  children?: List<BlockNodeKey>,
  parent?: ?BlockNodeKey,
  prevSibling?: ?BlockNodeKey,
  nextSibling?: ?BlockNodeKey,
};

const EMPTY_SET = OrderedSet();

const defaultRecord: ContentBlockNodeConfig = {
  parent: null,
  characterList: List(),
  data: Map(),
  depth: 0,
  key: '',
  text: '',
  type: 'unstyled',
  children: List(),
  prevSibling: null,
  nextSibling: null,
};

const haveEqualStyle = (
  charA: CharacterMetadata,
  charB: CharacterMetadata,
): boolean => charA.getStyle() === charB.getStyle();

const haveEqualEntity = (
  charA: CharacterMetadata,
  charB: CharacterMetadata,
): boolean => charA.getEntity() === charB.getEntity();

const decorateCharacterList = (
  config: ContentBlockNodeConfig,
): ContentBlockNodeConfig => {
  if (!config) {
    return config;
  }

  const {characterList, text} = config;

  if (text && !characterList) {
    config.characterList = List(Repeat(CharacterMetadata.EMPTY, text.length));
  }

  return config;
};

class ContentBlockNode extends Record(defaultRecord) implements BlockNode {
  constructor(props: ContentBlockNodeConfig = defaultRecord) {
    super(decorateCharacterList(props));
  }

  getKey(): BlockNodeKey {
    return this.get('key');
  }

  getType(): DraftBlockType {
    return this.get('type');
  }

  getText(): string {
    return this.get('text');
  }

  getCharacterList(): List<CharacterMetadata> {
    return this.get('characterList');
  }

  getLength(): number {
    return this.getText().length;
  }

  getDepth(): number {
    return this.get('depth');
  }

  getData(): Map<any, any> {
    return this.get('data');
  }

  getInlineStyleAt(offset: number): DraftInlineStyle {
    var character = this.getCharacterList().get(offset);
    return character ? character.getStyle() : EMPTY_SET;
  }

  getEntityAt(offset: number): ?string {
    var character = this.getCharacterList().get(offset);
    return character ? character.getEntity() : null;
  }

  getChildKeys(): List<BlockNodeKey> {
    return this.get('children');
  }

  getParentKey(): ?BlockNodeKey {
    return this.get('parent');
  }

  getPrevSiblingKey(): ?BlockNodeKey {
    return this.get('prevSibling');
  }

  getNextSiblingKey(): ?BlockNodeKey {
    return this.get('nextSibling');
  }

  findStyleRanges(
    filterFn: (value: CharacterMetadata) => boolean,
    callback: (start: number, end: number) => void,
  ): void {
    findRangesImmutable(
      this.getCharacterList(),
      haveEqualStyle,
      filterFn,
      callback,
    );
  }

  findEntityRanges(
    filterFn: (value: CharacterMetadata) => boolean,
    callback: (start: number, end: number) => void,
  ): void {
    findRangesImmutable(
      this.getCharacterList(),
      haveEqualEntity,
      filterFn,
      callback,
    );
  }
}

module.exports = ContentBlockNode;
