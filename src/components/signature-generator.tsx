"use client"

import { useState, useRef, type ChangeEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import domtoimage from 'dom-to-image-more';
import { User, Briefcase, Building2, Phone, MapPin, Upload, Building, PhoneCall, MapPinned } from "lucide-react"
import Image from "next/image"

export default function SignatureGenerator() {
    const [formData, setFormData] = useState({
        name: "",
        role: "",
        department: "",
        phone: "",
        address: "",
    })
    const [avatar, setAvatar] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleAvatarUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setAvatar(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleDownload = async () => {
        const signatureElement = document.getElementById("signature-preview");
        if (!signatureElement) return;

        // Clona o elemento para manipulação sem afetar a visualização original
        const clone = signatureElement.cloneNode(true) as HTMLElement;

        // Função para verificar se todas as imagens foram carregadas
        const waitForImagesToLoad = async (element: HTMLElement) => {
            const imgElements = element.querySelectorAll("img");
            const promises = Array.from(imgElements).map((img) => {
                return new Promise<void>((resolve) => {
                    if (img.complete) {
                        resolve();
                    } else {
                        img.onload = () => resolve();
                        img.onerror = () => resolve(); // Para evitar travamento caso uma imagem falhe
                    }
                });
            });
            await Promise.all(promises);
        };

        // Remove bordas indesejadas dos elementos clonados
        clone.querySelectorAll("*").forEach((el) => {
            (el as HTMLElement).style.border = "none";
        });

        // Injeta um CSS no clone para sobrescrever pseudo-elementos que possam estar aplicando sombras/bordas
        const style = document.createElement("style");
        clone.insertBefore(style, clone.firstChild);

        // Posiciona o clone fora da tela para que não interfira na visualização
        clone.style.position = "absolute";
        clone.style.top = "-9999px";

        // Define a largura do clone para 700px, altura automática
        clone.style.width = "700px";
        clone.style.height = "auto";

        document.body.appendChild(clone);

        // Aguarda o carregamento de todas as imagens antes de capturar a imagem
        await waitForImagesToLoad(clone);

        // Aguarda o reflow para calcular a nova altura
        const newHeight = clone.offsetHeight;

        try {
            // Gera a imagem com largura de 700px e a altura calculada
            const dataUrl = await domtoimage.toPng(clone, {
                width: 700,
                height: newHeight,
                bgcolor: "white",
            });
            const link = document.createElement("a");
            link.download = "assinatura-email.png";
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error("Erro ao gerar assinatura:", error);
        } finally {
            // Remove o clone da DOM após a captura
            document.body.removeChild(clone);
        }
    };




    function formatName(name: string) {
        if (!name) return "Nome Completo";

        const ignoreWords = ["da", "do", "das", "dos"];

        // Divide o nome em palavras, removendo espaços extras
        let words = name
            .trim()
            .split(/\s+/) // Divide corretamente os espaços múltiplos
            .filter(word => !ignoreWords.includes(word.toLowerCase())) // Remove 'da', 'do', etc.
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()); // Ajusta maiúsculas e minúsculas

        if (words.length > 2) {
            // Mantém o primeiro e último nome completos e reduz os intermediários para a inicial + "."
            return `${words[0]} ${words.slice(1, -1).map(w => w.charAt(0) + ".").join(" ")} ${words[words.length - 1]}`;
        }

        return words.join(" ");
    }

    function formatPhone(phone: string) {
        if (!phone) return "Telefone"
        return phone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
    }

    function getInitials(name: string) {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
    }

    return (
        <div className="container mx-auto p-6 max-w-3xl">
            <h1 className="text-2xl font-bold mb-6 text-center text-[#375582]">Gerador de Assinatura <br /> de E-mail</h1>

            <div className="grid md:grid-cols-1 gap-6 ">
                {/* Visualização da Assinatura */}
                <div className="overflow-scroll shadow-2xl">
                    <div className="space-y-4  min-w-[700px] ">
                        <Card className="p-2 bg-white border-4 border-white ">
                            <div id="signature-preview" className="p-4 bg-white">
                                <div className="font-sans text-sm space-y-4 sm:space-y-6">
                                    {/* Header */}
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex   gap-4 flex-1 ">
                                            <Avatar className="w-16 h-16 sm:w-20 sm:h-20 border-4 ring-4 ring-sky-500 border-white">
                                                <AvatarImage src={avatar || undefined} alt="Avatar" />
                                                <AvatarFallback className="font-semibold text-4xl text-slate-500">{getInitials(formData.name)}</AvatarFallback>
                                            </Avatar>
                                            <div className="text-left mt-1 md:mt-3 ml-2  w-full">
                                                <p className="font-bold text-xl text-[#375582]">{formatName(formData.name)}</p>
                                                <p className="text-[#0266AF] text-lg font-semibold">{formData.role || "Cargo/Função"}</p>
                                            </div>
                                        </div>
                                        <div className=" w-48">
                                            <img
                                                src="/assinatura-prefeitura-itaguaí.png"
                                                alt="Prefeitura de Itaguaí"
                                                className="w-fullmd:w-48 object-cover"
                                            />
                                        </div>
                                    </div>

                                    {/* Grid Info */}
                                    <div className="flex sm:gap-2 border-t pt-5">
                                        <div className="space-y-1 text-[#375582] flex-1">
                                            <div className="flex items-center gap-1 ">
                                                <Building className="w-5 h-5 flex-shrink-0" />
                                                <span className="font-semibold">Departamento</span>
                                            </div>
                                            <p className="text-base font-medium text-slate-500">{formData.department || "Departamento"}</p>
                                        </div>

                                        <div className="space-y-1 text-[#375582] w-44 ">
                                            <div className="flex items-center gap-2 ">
                                                <MapPinned className="w-5 h-5 flex-shrink-0" />
                                                <span className="font-semibold">Endereço</span>
                                            </div>
                                            <p className="text-base font-medium text-slate-500">{formData.address || "Endereço"}</p>
                                        </div>

                                        <div className="space-y-1 text-[#375582] w-44">
                                            <div className="flex items-center gap-2 ">
                                                <PhoneCall className="w-5 h-5 flex-shrink-0" />
                                                <span className="font-semibold">Telefone</span>
                                            </div>
                                            <p className="text-base font-medium text-slate-500">{formatPhone(formData.phone)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
                <Card className="p-6 bg-white  shadow-xl shadow-slate-200">
                    <form className="space-y-4">
                        <div>
                            <Label htmlFor="name">Nome Completo</Label>
                            <div className="relative">
                                <User className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <Input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Ex: João Silva"
                                    className="pl-8"
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="role">Cargo</Label>
                            <div className="relative">
                                <Briefcase className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <Input
                                    id="role"
                                    name="role"
                                    value={formData.role}
                                    onChange={handleInputChange}
                                    placeholder="Ex: Gerente de Vendas"
                                    className="pl-8"
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="department">Departamento</Label>
                            <div className="relative">
                                <Building2 className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                                <select
                                    id="department"
                                    name="department"
                                    value={formData.department}
                                    onChange={handleInputChange}
                                    className="flex h-10 w-full text-slate-600 rounded-md border border-input bg-background pl-8 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0266AF] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="">Selecione o departamento</option>
                                    <option value="GP - Gabinete do Prefeito">GP - Gabinete do Prefeito</option>
                                    <option value="VP - Gabinete do Vice-Prefeito">VP - Gabinete do Vice-Prefeito</option>
                                    <option value="PGM - Procuradoria Geral do Município">PGM - Procuradoria Geral do Município</option>
                                    <option value="CGM - Controladoria Geral do Governo">CGM - Controladoria Geral do Governo</option>
                                    <option value="SMGOV - Secretaria Municipal de Governo">
                                        SMGOV - Secretaria Municipal de Governo
                                    </option>
                                    <option value="SMADM - Secretaria Municipal de Administração">
                                        SMADM - Secretaria Municipal de Administração
                                    </option>
                                    <option value="SMALIC - Secretaria Municipal de Licitações e Contratos">
                                        SMALIC - Secretaria Municipal de Licitações e Contratos
                                    </option>
                                    <option value="SMEDU - Secretaria Municipal de Educação">
                                        SMEDU - Secretaria Municipal de Educação
                                    </option>
                                    <option value="SMSAU - Secretaria Municipal de Saúde">SMSAU - Secretaria Municipal de Saúde</option>
                                    <option value="SMAAS - Secretaria Municipal de Assistência Social">
                                        SMAAS - Secretaria Municipal de Assistência Social
                                    </option>
                                    <option value="SMOPLU - Secretaria Municipal de Ordem Pública e Limpeza Urbana">
                                        SMOPLU - Secretaria Municipal de Ordem Pública e Limpeza Urbana
                                    </option>
                                    <option value="SMTMU - Secretaria Municipal de Transportes e Mobilidade Urbana">
                                        SMTMU - Secretaria Municipal de Transportes e Mobilidade Urbana
                                    </option>
                                    <option value="SMCUL - Secretaria Municipal de Cultura">
                                        SMCUL - Secretaria Municipal de Cultura
                                    </option>
                                    <option value="SMESP - Secretaria Municipal de Esportes">
                                        SMESP - Secretaria Municipal de Esportes
                                    </option>
                                    <option value="SMAMCPA - Secretaria Municipal do Ambiente, Mudanças do Clima e Bem-Estar Animal">
                                        SMAMCPA - Secretaria Municipal do Ambiente, Mudanças do Clima e Bem-Estar Animal
                                    </option>
                                    <option value="SMAPA - Secretaria Municipal de Agricultura, Pesca e Abastecimento">
                                        SMAPA - Secretaria Municipal de Agricultura, Pesca e Abastecimento
                                    </option>
                                    <option value="SMCTIC - Secretaria Municipal de Ciência, Tecnologia, Inovação e Comunicação">
                                        SMCTIC - Secretaria Municipal de Ciência, Tecnologia, Inovação e Comunicação
                                    </option>
                                    <option value="SMFPL - Secretaria Municipal de Fazenda e Planejamento">
                                        SMFPL - Secretaria Municipal de Fazenda e Planejamento
                                    </option>
                                    <option value="SMOU - Secretaria Municipal de Obras e Urbanismo">
                                        SMOU - Secretaria Municipal de Obras e Urbanismo
                                    </option>
                                    <option value="SMSPDT - Secretaria Municipal de Defesa Civil, Defesa e Trânsito">
                                        SMSPDT - Secretaria Municipal de Defesa Civil, Defesa e Trânsito
                                    </option>
                                    <option value="SMSEG - Secretaria Municipal de Segurança Pública">
                                        SMSEG - Secretaria Municipal de Segurança Pública
                                    </option>
                                    <option value="SMEV - Secretaria Municipal de Eventos">SMEV - Secretaria Municipal de Eventos</option>
                                    <option value="SMDE - Secretaria Municipal de Desenvolvimento Econômico">
                                        SMDE - Secretaria Municipal de Desenvolvimento Econômico
                                    </option>
                                    <option value="CIAITA - CODUITA - Companhia Municipal de Desenvolvimento Urbano de Itaguaí">
                                        CIAITA - CODUITA - Companhia Municipal de Desenvolvimento Urbano de Itaguaí
                                    </option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="phone">Telefone</Label>
                            <div className="relative">
                                <Phone className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <Input
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder="Ex: +55 11 99999-9999"
                                    className="pl-8"
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="address">Endereço</Label>
                            <div className="relative">
                                <MapPin className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <Input
                                    id="address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    placeholder="Ex: Av. Paulista, 1000 - São Paulo, SP"
                                    className="pl-8"
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="avatar">Foto de Perfil (Opcional)</Label>
                            <div className="flex items-center space-x-4">
                                <Avatar className="w-12 h-12 border-4">
                                    <AvatarImage src={avatar || undefined} alt="Avatar" />
                                    <AvatarFallback>{getInitials(formData.name)}</AvatarFallback>
                                </Avatar>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center space-x-1"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Upload size={16} />
                                    <span>Upload</span>
                                </Button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    id="avatar"
                                    name="avatar"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleAvatarUpload}
                                />
                            </div>
                        </div>
                    </form>
                </Card>
                <Button onClick={handleDownload} className="w-full bg-[#0266AF] hover:bg-sky-600 text-sky-50 h-12">
                    Baixar Assinatura
                </Button>

            </div>
        </div>
    )
}

