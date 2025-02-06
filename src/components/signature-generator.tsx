"use client"

import { useState, useRef, type ChangeEvent, useEffect } from "react"
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
    const [isDownloadable, setIsDownloadable] = useState(false);
    const [buttonState, setButtonState] = useState("default");

    useEffect(() => {
        const allFieldsFilled = Object.values(formData).every(field => field.trim() !== "");
        setIsDownloadable(allFieldsFilled);
    }, [formData]);



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

        const requiredFields = document.querySelectorAll(".required-field");
        const allFieldsFilled = Array.from(requiredFields).every(field => (field as HTMLInputElement).value.trim() !== "");

        if (!allFieldsFilled) {
            alert("Preencha todos os campos obrigatórios antes de baixar a assinatura.");
            return;
        }

        const button = document.getElementById("download-button");
        if (!button) {
            console.error("Botão de download não encontrado");
            return;
        }

        button.disabled = true;
        button.innerText = "Gerando...";
        button.style.backgroundColor = "gray";

        const clone = signatureElement.cloneNode(true) as HTMLElement;

        const waitForImagesToLoad = async (element: HTMLElement) => {
            const imgElements = element.querySelectorAll("img");
            const promises = Array.from(imgElements).map((img) => {
                return new Promise<void>((resolve) => {
                    if (img.complete) {
                        resolve();
                    } else {
                        img.onload = () => resolve();
                        img.onerror = () => resolve();
                    }
                });
            });
            await Promise.all(promises);
        };

        clone.querySelectorAll("*").forEach((el) => {
            (el as HTMLElement).style.border = "none";
        });

        const style = document.createElement("style");
        clone.insertBefore(style, clone.firstChild);

        clone.style.position = "absolute";
        clone.style.top = "-9999px";
        clone.style.width = "700px";
        clone.style.height = "auto";

        document.body.appendChild(clone);

        await waitForImagesToLoad(clone);
        const newHeight = clone.offsetHeight;

        try {
            const dataUrl = await domtoimage.toPng(clone, {
                width: 700,
                height: newHeight,
                bgcolor: "white",
            });
            const link = document.createElement("a");
            link.download = "assinatura-email.png";
            link.href = dataUrl;
            link.click();

            button.innerText = "Download concluído!";
            button.style.backgroundColor = "green";

            setTimeout(() => {
                button.innerText = "Baixar Assinatura";
                button.style.backgroundColor = "";
                button.disabled = false;
            }, 3000);
        } catch (error) {
            console.error("Erro ao gerar assinatura:", error);
            button.innerText = "Erro no Download";
            button.style.backgroundColor = "red";

            setTimeout(() => {
                button.innerText = "Baixar Assinatura";
                button.style.backgroundColor = "";
                button.disabled = false;
            }, 3000);
        } finally {
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

    function formatPhone(phone: string): string {
        if (!phone) return "";

        // Remove tudo que não for número
        let numericValue = phone.replace(/\D/g, "");

        // Limita o número a 11 dígitos (DDD + número)
        numericValue = numericValue.slice(0, 11);

        // Aplica a máscara automaticamente
        if (numericValue.length <= 10) {
            // Telefone fixo (XX) XXXX-XXXX
            return numericValue.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
        } else {
            // Telefone celular (XX) XXXXX-XXXX
            return numericValue.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
        }
    }



    const handlePhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPhone(e.target.value);
        setFormData((prev) => ({ ...prev, phone: formatted }));
    };

    function getInitials(name: string) {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
    }

    function capitalizeWords(text: string): string {
        if (!text) return "";

        const lowercaseWords = ["e", "de", "do", "da", "dos", "das", "em", "no", "na", "nos", "nas", "com", "por", "a", "o"]; // Lista de palavras que devem permanecer minúsculas

        return text
            .toLocaleLowerCase("pt-BR") // Converte tudo para minúsculas corretamente
            .split(/\s+/) // Divide corretamente por espaços múltiplos
            .map((word, index) =>
                lowercaseWords.includes(word) && index !== 0 // Mantém as palavras da lista minúsculas, exceto se for a primeira
                    ? word
                    : word.charAt(0).toLocaleUpperCase("pt-BR") + word.slice(1)
            )
            .join(" "); // Junta as palavras novamente
    }




    return (
        <div className="container mx-auto  max-w-3xl">
            <h1 className="text-lg md:text-3xl font-bold mb-6 text-center text-[#375582] mt-5">Gerador de Assinatura de E-mail</h1>
            <div className="grid md:grid-cols-1 ">
                {/* Visualização da Assinatura */}
                <div className=" rounded-xl overflow-scroll md:overflow-auto px-6 pb-3">
                    <div className="space-y-4  min-w-[700px] ">
                        <Card className="p-2 bg-white/90 border-4 border-white rounded-xl drop-shadow-2xl">
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
                                                <p className="font-bold text-2xl text-[#375582]">{formatName(formData.name)}</p>
                                                <p className="text-[#0266AF] text-lg font-semibold">{formData.role || "Cargo/Função"}</p>
                                            </div>
                                        </div>
                                        <div className="  flex items-center justify-center">
                                            <img
                                                src="/assinatura-prefeitura-itaguaí.png"
                                                alt="Prefeitura de Itaguaí"
                                                className="w-56 object-contain"
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

                                        <div className="space-y-1 text-[#375582] w-52 ">
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
                <div className="p-6">
                    <Card className="p-6 bg-white/70  shadow-xl shadow-slate-200 ">
                        <form className="space-y-4 ">
                            <div>
                                <Label htmlFor="name">Nome Completo</Label>
                                <div className="relative">
                                    <User className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <Input
                                        id="name"
                                        name="name"
                                        required
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
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                role: capitalizeWords(e.target.value),
                                            }))
                                        }
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
                                        type="tel"
                                        inputMode="numeric"
                                        value={formData.phone}
                                        onChange={handlePhoneInputChange}
                                        placeholder="(XX) XXXXX-XXXX"
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
                    <Button
                        id="download-button"
                        onClick={handleDownload}
                        disabled={!isDownloadable}
                        className={`w-full font-bold text-base h-12 mt-10 transition-colors duration-300 
        ${buttonState === "success" ? "bg-green-500 text-white" : "bg-[#0266AF] hover:bg-sky-600 text-sky-100"}`}
                    >
                        {buttonState === "success" ? "Download concluído" : "Baixar Assinatura"}
                    </Button>
                </div>
            </div>
            <div className="w-full h-24">

                <Image
                    width={150}
                    height={150}
                    className="h-full w-full max-w-[320px] mx-auto my-3"
                    alt="Logo SMCTIC - Secretaria Municipal de Ciência, Tecnologia, Inovação e Comunicação"
                    src="/logo-SMCTIC.svg"
                />
            </div>
        </div>
    )
}

