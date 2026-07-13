import React, { useState, useRef } from 'react';
import { db } from '@/api/dbClient';
import { uploadImage } from '@/services/storageService';
import { analyzeImage } from '@/services/aiService';
import { Camera, ImagePlus, ArrowLeft, Sunset, PartyPopper, Trees, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import AnalysisAnimation from '@/components/capture/AnalysisAnimation';
import RevealAnimation from '@/components/capture/RevealAnimation';
import CameraView from '@/components/capture/CameraView';
import { useToast } from '@/components/ui/use-toast';
import { compressImage } from '@/lib/imageCompress';
import { getStoredProfileId } from '@/lib/session';

const CREATURE_PROMPT = `당신은 HandsDex(핸즈덱스), 판타지 생물 도감 AI입니다. 이 사진을 분석하고 장면 전체에서 영감을 받은 단 하나의 생물(또는 사람이 중심이면 NPC)을 만들어주세요. 개별 객체 인식이 아닙니다.

핵심 규칙:
1. 단순한 객체 인식을 절대 하지 마세요. 사진 뒤에 있는 이야기, 감정, 경험을 이해하세요.
2. 여러 객체가 있으면, 그것들을 하나의 통합된 경험으로 결합하여 하나의 생물로 만드세요.
3. 사람 사진: 친근한 RPG 스타일 NPC를 생성하세요. 외모를 평가하지 마세요.
4. 짧고 귀엽고 기억에 남는 독창적인 한국어 이름을 만드세요 (2~5음절). 그냥 "몬"을 붙이지 마세요. 몬스터 수집 게임의 생물 이름처럼 들리지만 완전히 독창적이어야 합니다.
5. 실제 장소를 RPG 판타지 장소로 변환하세요 (집→시작의 마을, 카페→브런치 로드 등)
6. 장면이 얼마나 특별한지에 따라 등급을 부여하세요:
   - Common(일반): 일상적인 순간 (책상, 음식, 출근)
   - Uncommon(고급): 즐거운 경험 (카페, 공원, 요리)
   - Rare(희귀): 특별한 순간 (일몰, 축하, 여행)
   - Epic(영웅): 비범한 경험 (콘서트, 모험, 희귀 자연)
   - Legendary(전설): 평생 한 번뿐인 순간

모든 텍스트(이름, 종, 타입, 설명, 위치 등)는 한국어로 작성하세요. 단 rarity는 영어 그대로 유지하세요.

타입은 다음 중에서 선택하세요: 불, 물, 자연, 전기, 아늑함, 집중, 밤, 사교, 음악, 음식, 모험, 창의, 기술, 스포츠, 사랑, 공부, 도시, 신비, 바람, 빛, 그림자, 얼음, 대화, 심야

다음 스키마에 정확히 맞는 유효한 JSON만 응답하세요:
{
  "name": "string (독창적인 한국어 생물 이름, 2~5음절, 귀엽고 기억에 남는)",
  "species": "string (종 분류, 창의적인 한국어)",
  "types": ["문자열 배열, 1~3개 타입"],
  "rarity": "string (Common, Uncommon, Rare, Epic, Legendary 중 하나, 영어 그대로)",
  "description": "string (도감식 설명, 2~3문장, 매력적이고 환상적인 한국어)",
  "fantasyLocation": "string (RPG 스타일 위치 이름, 한국어)",
  "worldDescription": "string (이 생물의 서식지/세계에 대한 1~2문장, 한국어)",
  "sceneSummary": "string (사진에서 이해한 내용, 한국어)",
  "mainFocus": "string (중심 경험이나 대상, 한국어)",
  "detectedObjects": ["문자열 배열, 한국어"],
  "primaryColors": ["3~4개 헥스 색상 코드"],
  "isHuman": false
}`;

export default function Capture() {
  const [phase, setPhase] = useState('upload');
  const [analysisStep, setAnalysisStep] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [creature, setCreature] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const fileRef = useRef(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  async function handleFile(file) {
    if (!file) return;

    // Compress large mobile photos before upload
    const compressed = await compressImage(file);

    const url = URL.createObjectURL(compressed);
    setPreviewUrl(url);
    setPhase('analyzing');
    setAnalysisStep(0);

    let stepTimer = null;
    try {
      let file_url;
      try {
        file_url = await uploadImage(compressed, 'creatures');
      } catch (uploadErr) {
        console.error('Upload error:', uploadErr);
        throw new Error(`사진 업로드 실패: ${uploadErr?.message || uploadErr}`);
      }
      setAnalysisStep(1);

      stepTimer = setInterval(() => {
        setAnalysisStep((s) => Math.min(s + 1, 3));
      }, 2500);

      let result;
      try {
        result = await analyzeImage(CREATURE_PROMPT, file_url, {
          type: 'object',
          properties: {
            name: { type: 'string' },
            species: { type: 'string' },
            types: { type: 'array', items: { type: 'string' } },
            rarity: { type: 'string' },
            description: { type: 'string' },
            fantasyLocation: { type: 'string' },
            worldDescription: { type: 'string' },
            sceneSummary: { type: 'string' },
            mainFocus: { type: 'string' },
            detectedObjects: { type: 'array', items: { type: 'string' } },
            primaryColors: { type: 'array', items: { type: 'string' } },
            isHuman: { type: 'boolean' },
          },
          required: ['name', 'species', 'types', 'rarity', 'description', 'fantasyLocation'],
        });
      } catch (llmErr) {
        console.error('AI error:', llmErr);
        throw new Error(llmErr?.message || 'AI 분석에 실패했어요.');
      }

      if (stepTimer) clearInterval(stepTimer);
      setAnalysisStep(3);

      const RARITY_MAP = {
        '일반': 'Common', '고급': 'Uncommon', '희귀': 'Rare', '영웅': 'Epic', '전설': 'Legendary',
        'common': 'Common', 'uncommon': 'Uncommon', 'rare': 'Rare', 'epic': 'Epic', 'legendary': 'Legendary',
      };
      const rawRarity = result.rarity || 'Common';
      const rarity = RARITY_MAP[rawRarity] || (['Common','Uncommon','Rare','Epic','Legendary'].includes(rawRarity) ? rawRarity : 'Common');

      let saved;
      try {
        saved = await db.entities.Creature.create({
          name: result.name,
          species: result.species,
          types: result.types || [],
          rarity,
          owner_profile_id: getStoredProfileId(),
          description: result.description,
          fantasy_location: result.fantasyLocation || result.fantasy_location || '',
          world_description: result.worldDescription || result.world_description || '',
          scene_summary: result.sceneSummary || result.scene_summary || '',
          main_focus: result.mainFocus || result.main_focus || '',
          detected_objects: result.detectedObjects || result.detected_objects || [],
          capture_date: new Date().toISOString().split('T')[0],
          image_url: file_url,
          primary_colors: result.primaryColors || result.primary_colors || [],
          is_human: result.isHuman || result.is_human || false,
        });
      } catch (saveErr) {
        console.error('DB save error:', saveErr);
        throw new Error(`생물 저장 실패: ${saveErr?.message || saveErr}`);
      }

      await new Promise((r) => setTimeout(r, 800));
      setCreature(saved);
      setPhase('reveal');
    } catch (err) {
      if (stepTimer) clearInterval(stepTimer);
      console.error(err);
      const errMsg = err?.message || err?.error || (typeof err === 'string' ? err : '알 수 없는 오류');
      toast({
        title: '발견 실패',
        description: errMsg,
        variant: 'destructive',
      });
      setPhase('upload');
    }
  }

  if (showCamera) {
    return (
      <CameraView
        onCapture={(file) => {
          setShowCamera(false);
          handleFile(file);
        }}
        onClose={() => setShowCamera(false)}
      />
    );
  }

  if (phase === 'reveal' && creature) {
    return (
      <RevealAnimation
        creature={creature}
        onDone={() => {
          setPhase('upload');
          setPreviewUrl(null);
          setCreature(null);
        }}
      />
    );
  }

  if (phase === 'analyzing') {
    return (
      <div className="max-w-lg mx-auto px-4 pt-6">
        <div className="mb-6">
          <h2 className="font-heading text-xl font-bold text-center">분석 중...</h2>
        </div>
        {previewUrl && (
          <div className="rounded-2xl overflow-hidden mb-6 aspect-square">
            <img src={previewUrl} alt="캡처" className="w-full h-full object-cover opacity-60" />
          </div>
        )}
        <AnalysisAnimation step={analysisStep} />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="font-heading text-xl font-bold">발견</h1>
      </div>

      {/* Upload area */}
      <div className="space-y-4">
        <div
          onClick={() => fileRef.current?.click()}
          className="aspect-square rounded-3xl border-2 border-dashed border-violet-300 bg-violet-50/50 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-violet-50 transition-colors"
        >
          <div className="w-20 h-20 rounded-full bg-violet-100 flex items-center justify-center">
            <ImagePlus className="w-10 h-10 text-violet-500" />
          </div>
          <div className="text-center">
            <p className="font-heading font-bold text-violet-700">손으로 찍어 도감에 남기기</p>
            <p className="text-sm text-violet-400 mt-1">뭐든 찍으면 당신의 도감에 기록돼요</p>
          </div>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />

        <Button
          onClick={() => setShowCamera(true)}
          className="w-full h-14 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 font-heading font-bold text-base gap-2"
        >
          <Camera className="w-5 h-5" />
          사진 촬영
        </Button>
      </div>

      {/* Tips */}
      <div className="mt-8 bg-white rounded-2xl p-5 shadow-sm border border-border/50">
        <h3 className="font-heading font-bold text-sm mb-3">희귀 발견 팁</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2">
            <Sunset className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <span>일몰과 골든 아워는 희귀 생물을 만들어요</span>
          </li>
          <li className="flex gap-2">
            <PartyPopper className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
            <span>특별한 순간은 영웅급 발견을 열 수 있어요</span>
          </li>
          <li className="flex gap-2">
            <Trees className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
            <span>자연 풍경은 종종 독특한 종을 만들어요</span>
          </li>
          <li className="flex gap-2">
            <Users className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <span>사람은 친근한 RPG 스타일 NPC가 돼요</span>
          </li>
        </ul>
      </div>
    </div>
  );
}